import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');
const sourcePomPath = join(repoRoot, 'coroutine-examples/pom.xml');
const host = process.env.KOTLIN_RUNNER_HOST ?? '127.0.0.1';
const port = Number(process.env.KOTLIN_RUNNER_PORT ?? 3001);
const maxOutputBytes = Number(process.env.KOTLIN_RUNNER_MAX_OUTPUT_BYTES ?? 2_000_000);
const defaultTimeoutMs = Number(process.env.KOTLIN_RUNNER_TIMEOUT_MS ?? 120_000);
const maxTimeoutMs = Number(process.env.KOTLIN_RUNNER_MAX_TIMEOUT_MS ?? 600_000);
let nextRequestId = 1;
const jobs = new Map();

const allowedOrigins = new Set([
  process.env.KOTLIN_RUNNER_ORIGIN,
  'http://localhost:4200',
  'http://127.0.0.1:4200'
].filter(Boolean));

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(request, response, 204, {});
    return;
  }

  const url = new URL(request.url ?? '/', `http://${host}:${port}`);

  if (request.method === 'POST' && url.pathname === '/run-kotlin') {
    await handleStartRun(request, response);
    return;
  }

  const jobId = getJobId(url.pathname);

  if (request.method === 'GET' && jobId) {
    handleGetRun(request, response, jobId);
    return;
  }

  if (request.method === 'DELETE' && jobId) {
    handleCancelRun(request, response, jobId);
    return;
  }

  sendJson(request, response, 404, { error: 'Not found' });
});

server.listen(port, host, () => {
  console.log(`Kotlin runner listening on http://${host}:${port}`);
});

async function handleStartRun(request, response) {
  try {
    const body = await readJsonBody(request);
    const code = typeof body.code === 'string' ? body.code : '';
    const timeoutMs = clamp(Number(body.timeoutMs ?? defaultTimeoutMs), 1_000, maxTimeoutMs);

    if (!code.trim()) {
      sendJson(request, response, 400, { error: 'Kotlin code is required.' });
      return;
    }

    const job = createJob(code, timeoutMs);
    jobs.set(job.id, job);
    startKotlinJob(job);

    sendJson(request, response, 202, {
      runId: job.id,
      statusUrl: `/run-kotlin/${job.id}`
    });
  } catch (error) {
    console.error(error);
    sendJson(request, response, 500, {
      error: error instanceof Error ? error.message : 'Unexpected runner error.'
    });
  }
}

function handleGetRun(request, response, jobId) {
  const job = jobs.get(jobId);

  if (!job) {
    sendJson(request, response, 404, { error: 'Not found' });
    return;
  }

  sendJson(request, response, 200, serializeJob(job));
}

function handleCancelRun(request, response, jobId) {
  const job = jobs.get(jobId);

  if (!job) {
    sendJson(request, response, 404, { error: 'Not found' });
    return;
  }

  if (job.status === 'running') {
    job.status = 'cancelled';
    job.aborted = true;
    job.abortController.abort();
  }

  sendJson(request, response, 200, serializeJob(job));
}

function createJob(code, timeoutMs) {
  const id = String(nextRequestId++);

  return {
    id,
    code,
    timeoutMs,
    abortController: new AbortController(),
    status: 'running',
    startedAt: Date.now(),
    finishedAt: null,
    exitCode: null,
    signal: null,
    timedOut: false,
    aborted: false,
    outputTruncated: false,
    stdout: '',
    stderr: '',
    error: undefined
  };
}

async function startKotlinJob(job) {
  console.log(`[run ${job.id}] started (${job.code.length} chars, timeout ${job.timeoutMs} ms)`);

  try {
    await runKotlin(job);
  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unexpected runner error.';
    console.error(error);
  } finally {
    if (job.status === 'running') {
      job.status = 'finished';
    }

    job.finishedAt = Date.now();

    console.log(
      `[run ${job.id}] ${job.status} in ${getDurationMs(job)} ms ` +
      `(exit ${job.exitCode ?? job.signal ?? 'unknown'})`
    );

    setTimeout(() => {
      jobs.delete(job.id);
    }, 10 * 60_000);
  }
}

async function runKotlin(job) {
  const workdir = await mkdtemp(join(tmpdir(), 'learn-coroutine-kotlin-'));

  try {
    const pomXml = await readFile(sourcePomPath, 'utf8');
    await writeFile(join(workdir, 'pom.xml'), pomXml, 'utf8');

    const sourceDir = join(workdir, 'src/main/kotlin');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'main.kt'), job.code, 'utf8');

    await runCommand('mvn', ['-q', '-DskipTests', 'compile', 'exec:java'], {
      cwd: workdir,
      job
    });
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

function runCommand(command, args, options) {
  return new Promise((resolveCommand) => {
    const startedAt = Date.now();
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: process.env
    });

    const job = options.job;
    let outputBytes = 0;

    const timeout = setTimeout(() => {
      job.timedOut = true;
      stopChild(child, 'SIGTERM');
    }, job.timeoutMs);

    const handleAbort = () => {
      job.aborted = true;
      stopChild(child, 'SIGTERM');
    };

    job.abortController.signal.addEventListener('abort', handleAbort, { once: true });

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      outputBytes += Buffer.byteLength(text);

      if (outputBytes <= maxOutputBytes) {
        job.stdout += text;
      } else {
        job.outputTruncated = true;
      }
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      outputBytes += Buffer.byteLength(text);

      if (outputBytes <= maxOutputBytes) {
        job.stderr += text;
      } else {
        job.outputTruncated = true;
      }
    });

    child.on('close', (exitCode, signal) => {
      clearTimeout(timeout);
      job.abortController.signal.removeEventListener('abort', handleAbort);
      job.exitCode = exitCode;
      job.signal = signal;

      if (job.aborted) {
        job.status = 'cancelled';
      }

      if (job.timedOut) {
        job.status = 'timed-out';
      }

      job.finishedAt = Date.now();
      job.durationMs = Date.now() - startedAt;

      resolveCommand();
    });
  });
}

function stopChild(child, signal) {
  if (child.exitCode !== null || child.killed) {
    return;
  }

  child.kill(signal);
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk.toString();

      if (body.length > 1_000_000) {
        request.destroy();
        rejectBody(new Error('Request body is too large.'));
      }
    });

    request.on('end', () => {
      try {
        resolveBody(JSON.parse(body || '{}'));
      } catch {
        rejectBody(new Error('Request body must be valid JSON.'));
      }
    });

    request.on('error', rejectBody);
  });
}

function sendJson(request, response, statusCode, payload) {
  response.writeHead(statusCode, {
    ...getCorsHeaders(request),
    'Content-Type': 'application/json'
  });

  if (statusCode === 204) {
    response.end();
    return;
  }

  response.end(JSON.stringify(payload));
}

function getCorsHeaders(request) {
  const origin = request?.headers?.origin;
  const allowedOrigin = allowedOrigins.has(origin) ? origin : 'http://127.0.0.1:4200';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function getJobId(pathname) {
  const match = pathname.match(/^\/run-kotlin\/([^/]+)$/);
  return match?.[1];
}

function serializeJob(job) {
  return {
    runId: job.id,
    status: job.status,
    exitCode: job.exitCode,
    signal: job.signal,
    timedOut: job.timedOut,
    aborted: job.aborted,
    outputTruncated: job.outputTruncated,
    durationMs: getDurationMs(job),
    stdout: job.stdout,
    stderr: job.stderr,
    error: job.error
  };
}

function getDurationMs(job) {
  return (job.finishedAt ?? Date.now()) - job.startedAt;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return defaultTimeoutMs;
  }

  return Math.min(Math.max(value, min), max);
}
