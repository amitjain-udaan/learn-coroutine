import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

import { KotlinPlaygroundComponent } from '../../../shared/kotlin-playground/kotlin-playground.component';
import { ThreadDetailComponent } from '../../../shared/thread-detail/thread-detail.component';

@Component({
  selector: 'app-thread-page',
  standalone: true,
  imports: [CardModule, DialogModule, TagModule, KotlinPlaygroundComponent, ThreadDetailComponent],
  template: `
    <section class="thread-page">
      <header class="page-header">
        <p-tag value="01 What/Why?" severity="info" />
        <h2>Thread</h2>
        <p>
          Before understanding threads, start with the path from a saved program to a running process.
        </p>
      </header>

      <p-card>
        <div class="os-diagram" aria-label="Program to process to thread diagram">
          <div class="diagram-node program-node">
            <span class="node-label">Program</span>
            <strong>Set of instructions</strong>
            <small>Stored on disk</small>
          </div>

          <span class="arrow pi pi-arrow-right" aria-hidden="true"></span>

          <div class="diagram-node process-node">
            <span class="node-label">Process</span>
            <strong>Program in execution</strong>
            <small>Created by the OS</small>

            <div class="process-body">
              <div class="process-layout" aria-label="Typical process memory layout">
                <span>Stack</span>
                <span>Heap</span>
                <span>Data</span>
                <span>Code / Text</span>
              </div>

              <div class="process-resources">
                <span>Open files</span>
                <span>Network sockets</span>
                <span>CPU scheduling</span>
              </div>
            </div>

            <div class="thread-list" aria-label="Multiple threads inside a process">
              <div class="thread-box">
                Thread 1
              </div>
              <div class="thread-box">
                Thread 2
              </div>
              <div class="thread-box">
                Thread 3
              </div>
            </div>
          </div>

          <span class="arrow pi pi-arrow-right" aria-hidden="true"></span>

          <div
            class="diagram-node thread-node"
            role="button"
            tabindex="0"
            aria-label="Open thread detail"
            (click)="openThreadDetail()"
            (keydown.enter)="openThreadDetail()"
            (keydown.space)="openThreadDetail()">
            <span class="node-label">Thread</span>
            <strong>Execution path</strong>
            <small>Click for more detail</small>

            <div class="thread-state-preview">
              <span>Program counter</span>
              <span>Registers</span>
              <span>Stack</span>
            </div>
          </div>
        </div>
      </p-card>

      <p-dialog
        header="Thread"
        [(visible)]="isThreadDetailOpen"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [style]="{ width: 'min(38rem, 92vw)' }">
        <app-thread-detail />
      </p-dialog>

      <div class="lesson-grid">
        <p-card>
          <h3>Program</h3>
          <p>
            A program is a set of instructions stored on disk. It is passive until the operating system
            loads it and starts running it.
          </p>
        </p-card>

        <p-card>
          <h3>Process</h3>
          <p>
            A process is a program in execution. In a typical OS diagram, it owns an address space made
            of code/text, data, heap, and stack, plus resources such as open files and network sockets.
          </p>
        </p-card>

        <p-card>
          <h3>Thread</h3>
          <p>
            A thread is the execution path inside a process. A process can have one or many threads,
            and each thread has its own program counter, registers, and stack while sharing the process
            code, data, heap, and OS resources.
          </p>
        </p-card>
      </div>

      <p-card>
        <h3>How Jetty manages server threads</h3>
        <p>
          Think of Jetty as a traffic controller. A request is accepted, watched for I/O, converted into
          work, and then a pooled worker thread runs your application code.
        </p>

        <div class="jetty-diagram" aria-label="Jetty thread management diagram">
          <div class="jetty-flowchart">
            <div class="flow-step client-step">
              <span class="step-number">1</span>
              <span class="node-label">Browser / client</span>
              <strong>Sends HTTP request</strong>
              <small>Example: GET /lessons</small>
            </div>

            <span class="flow-arrow pi pi-arrow-right" aria-hidden="true"></span>

            <div class="flow-step acceptor-step">
              <span class="step-number">2</span>
              <span class="node-label">Acceptor thread</span>
              <strong>Accepts connection</strong>
              <small>Creates/registers the socket</small>
            </div>

            <span class="flow-arrow pi pi-arrow-right" aria-hidden="true"></span>

            <div class="flow-step selector-step">
              <span class="step-number">3</span>
              <span class="node-label">Selector thread</span>
              <strong>Waits for I/O</strong>
              <small>Socket is ready to read/write</small>
            </div>

            <span class="flow-arrow pi pi-arrow-down" aria-hidden="true"></span>

            <div class="pool-step">
              <div class="pool-title">
                <span class="node-label">QueuedThreadPool</span>
                <strong>Jetty's shared thread pool</strong>
                <small>Threads are reused instead of creating one permanent thread per request</small>
              </div>

              <div class="pool-flow">
                <div class="mini-step">
                  <span class="node-label">4</span>
                  <strong>Task waits</strong>
                  <small>Request work enters the queue</small>
                </div>

                <span class="mini-arrow pi pi-arrow-right" aria-hidden="true"></span>

                <div class="mini-step">
                  <span class="node-label">5</span>
                  <strong>Worker picked</strong>
                  <small>A free pooled thread takes the task</small>
                </div>

                <span class="mini-arrow pi pi-arrow-right" aria-hidden="true"></span>

                <div class="mini-step">
                  <span class="node-label">6</span>
                  <strong>App code runs</strong>
                  <small>Handler, servlet, API, or WebSocket code</small>
                </div>
              </div>
            </div>

            <span class="flow-arrow pi pi-arrow-down" aria-hidden="true"></span>

            <div class="flow-step response-step">
              <span class="step-number">7</span>
              <span class="node-label">Response</span>
              <strong>Result is written back</strong>
              <small>The worker becomes available for another task</small>
            </div>
          </div>

          <div class="jetty-note">
            <strong>Remember:</strong>
            <span>Acceptors and selectors are Jetty's network threads. Worker threads are where your request code runs.</span>
          </div>

          <div class="jetty-models" aria-label="Blocking request model compared with async request model">
            <div class="jetty-model blocking-model">
              <div class="model-header">
                <span class="node-label">Model A</span>
                <strong>Jetty is async, but your request blocks</strong>
              </div>

              <div class="model-flow">
                <span>Worker starts request</span>
                <i class="pi pi-arrow-right" aria-hidden="true"></i>
                <span>App calls blocking I/O</span>
                <i class="pi pi-arrow-right" aria-hidden="true"></i>
                <span class="blocked-step">Worker waits and cannot serve another request</span>
                <i class="pi pi-arrow-right" aria-hidden="true"></i>
                <span>I/O finishes, response completes</span>
              </div>

              <p>
                Jetty can accept and watch many connections asynchronously, but it cannot magically free a
                worker thread that is inside blocking application code.
              </p>
            </div>

            <div class="jetty-model async-model">
              <div class="model-header">
                <span class="node-label">Model B</span>
                <strong>Request uses async I/O and frees the worker</strong>
              </div>

              <div class="model-flow">
                <span>Worker starts request</span>
                <i class="pi pi-arrow-right" aria-hidden="true"></i>
                <span>App starts async I/O</span>
                <i class="pi pi-arrow-right" aria-hidden="true"></i>
                <span class="free-step">Request suspends, worker returns to pool</span>
                <i class="pi pi-arrow-right" aria-hidden="true"></i>
                <span>I/O callback resumes and completes response</span>
              </div>

              <p>
                This is the scalable path: the request is still alive, but a platform thread does not sit
                idle while the external I/O is pending.
              </p>
            </div>
          </div>
        </div>
      </p-card>

      <p-card>
        <h3>Why it matters for coroutines</h3>
        <p>
          Coroutines do not replace the OS process. They are lightweight work units that run on threads.
          A coroutine can suspend without blocking the thread, so the same thread can continue doing other work.
        </p>
        <pre><code>Program -> Process -> Thread -> Coroutine work

Process: code/text + data + heap + resources
Thread: program counter + registers + stack

Thread.sleep(1000) blocks the thread
delay(1000) suspends the coroutine</code></pre>
      </p-card>

      <p-card>
        <h3>Jetty threads, coroutines, and context switching</h3>
        <p>
          Use this mental model: coroutines are suspendable tasks, dispatchers schedule coroutines onto
          Java threads, Java threads normally map to OS threads, and the CPU executes OS threads. Jetty's
          thread pool is separate from coroutine dispatcher pools such as <code>Dispatchers.Default</code>
          and <code>Dispatchers.IO</code>.
        </p>

        <img
          class="thread-cost-image"
          src="assets/jetty-os-thread-context-switch.svg"
          alt="Two vertical diagrams comparing Jetty worker threads with coroutine dispatcher threads and their OS thread mappings"
        />

        <div class="cost-grid">
          <div>
            <strong>Different owners</strong>
            <p>
              Jetty owns Jetty threads. Coroutine dispatchers own dispatcher threads. Both are JVM threads,
              and JVM threads are normally backed one-to-one by OS threads.
            </p>
          </div>

          <div>
            <strong>Different schedulers</strong>
            <p>
              Coroutine dispatchers schedule coroutines onto Java threads. The operating-system scheduler
              schedules OS threads onto CPU cores. These are separate scheduling layers.
            </p>
          </div>

          <div>
            <strong>One request can fan out</strong>
            <p>
              A classic request may use many thread-backed pools. A coroutine request may launch many
              coroutines. In both cases, the CPU ultimately runs only OS threads.
            </p>
          </div>
        </div>
      </p-card>

      <p-card>
        <h3>Edit a Kotlin thread example</h3>
        <p>
          Run this small example and change the sleeps or printed labels. Notice that both workers run on
          real JVM threads, and the main thread waits for them with <code>join()</code>.
        </p>

        <app-kotlin-playground [startingCode]="threadExampleCode" />
      </p-card>
    </section>
  `,
  styles: [`
    .thread-page {
      display: grid;
      gap: 1rem;
    }

    .page-header {
      display: grid;
      gap: .5rem;
      max-width: 48rem;
    }

    h2,
    h3,
    p {
      margin: 0;
    }

    h2 {
      color: #111827;
      font-size: 1.75rem;
      line-height: 1.25;
    }

    h3 {
      margin-bottom: .75rem;
      color: #111827;
      font-size: 1rem;
      line-height: 1.35;
    }

    p {
      color: #4b5563;
      line-height: 1.6;
    }

    small {
      color: #6b7280;
      font-size: .8125rem;
    }

    .os-diagram {
      display: grid;
      grid-template-columns: minmax(9.5rem, .8fr) 2rem minmax(24rem, 1.8fr) 2rem minmax(11rem, .9fr);
      gap: .85rem;
      align-items: center;
    }

    .diagram-node {
      min-height: 12rem;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
      display: grid;
      align-content: start;
      gap: .5rem;
    }

    .program-node {
      border-top: .25rem solid #2563eb;
    }

    .process-node {
      border-top: .25rem solid #059669;
    }

    .thread-node {
      border-top: .25rem solid #d97706;
      cursor: pointer;
      transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
    }

    .thread-node:hover,
    .thread-node:focus-visible {
      border-color: #d97706;
      box-shadow: 0 10px 24px rgb(17 24 39 / 12%);
      outline: 0;
      transform: translateY(-1px);
    }

    .node-label {
      color: #6b7280;
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .process-body {
      display: grid;
      grid-template-columns: minmax(8rem, .9fr) minmax(9rem, 1fr);
      gap: .75rem;
      margin-top: .5rem;
      align-items: stretch;
    }

    .process-layout {
      display: grid;
      gap: .35rem;
      padding: .5rem;
      border: 1px solid #d1fae5;
      border-radius: .5rem;
      background: #f0fdf4;
    }

    .process-layout span {
      min-height: 1.9rem;
      padding: .35rem .5rem;
      border-radius: .375rem;
      background: #ffffff;
      color: #065f46;
      font-size: .8125rem;
      font-weight: 700;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .process-resources {
      display: grid;
      gap: .4rem;
    }

    .process-resources span {
      min-height: 2rem;
      padding: .4rem .5rem;
      border-radius: .375rem;
      background: #f3f4f6;
      color: #374151;
      font-size: .8125rem;
      font-weight: 600;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .thread-state-preview {
      display: grid;
      gap: .5rem;
      margin-top: .5rem;
    }

    .thread-state-preview span {
      min-height: 2rem;
      padding: .4rem .5rem;
      border-radius: .375rem;
      background: #fffbeb;
      color: #92400e;
      font-size: .8125rem;
      font-weight: 700;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .thread-list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .5rem;
      margin-top: .75rem;
    }

    .thread-box {
      min-width: 0;
      min-height: 2.5rem;
      padding: .45rem .55rem;
      border: 1px solid #fde68a;
      border-radius: .5rem;
      background: #fffbeb;
      color: #92400e;
      font-size: .8125rem;
      font-weight: 700;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .arrow {
      color: #6b7280;
      font-size: 1.25rem;
    }

    .lesson-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      gap: 1rem;
    }

    .jetty-diagram {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }

    .jetty-flowchart {
      display: grid;
      grid-template-columns: minmax(10rem, 1fr) 2rem minmax(10rem, 1fr) 2rem minmax(10rem, 1fr);
      gap: .75rem;
      align-items: center;
    }

    .flow-step,
    .pool-step {
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
    }

    .flow-step {
      min-height: 9rem;
      padding: 1rem;
      display: grid;
      align-content: start;
      gap: .5rem;
      position: relative;
    }

    .step-number {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 999px;
      background: #111827;
      color: #ffffff;
      font-size: .8125rem;
      font-weight: 800;
      display: grid;
      place-items: center;
    }

    .client-step {
      border-top: .25rem solid #2563eb;
    }

    .acceptor-step {
      border-top: .25rem solid #7c3aed;
    }

    .selector-step {
      border-top: .25rem solid #0891b2;
    }

    .response-step {
      grid-column: 2 / 5;
      border-top: .25rem solid #059669;
    }

    .flow-arrow,
    .mini-arrow {
      color: #6b7280;
      font-size: 1.25rem;
      justify-self: center;
    }

    .pool-step {
      grid-column: 1 / -1;
      padding: 1rem;
      border-top: .25rem solid #111827;
      display: grid;
      gap: 1rem;
    }

    .pool-title {
      display: grid;
      gap: .35rem;
    }

    .pool-flow {
      display: grid;
      grid-template-columns: minmax(10rem, 1fr) 2rem minmax(10rem, 1fr) 2rem minmax(10rem, 1fr);
      gap: .75rem;
      align-items: center;
    }

    .mini-step {
      min-width: 0;
      padding: .75rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #f9fafb;
      display: grid;
      gap: .5rem;
      align-content: start;
      min-height: 7rem;
    }

    .jetty-note {
      display: flex;
      flex-wrap: wrap;
      gap: .35rem;
      padding: .85rem 1rem;
      border: 1px solid #bae6fd;
      border-radius: .5rem;
      background: #f0f9ff;
      color: #075985;
      line-height: 1.5;
    }

    .jetty-models {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .jetty-model {
      min-width: 0;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
      display: grid;
      gap: 1rem;
      align-content: start;
    }

    .blocking-model {
      border-top: .25rem solid #dc2626;
    }

    .async-model {
      border-top: .25rem solid #059669;
    }

    .model-header {
      display: grid;
      gap: .35rem;
    }

    .model-flow {
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
      gap: .5rem;
      align-items: center;
    }

    .model-flow span {
      min-height: 4.5rem;
      padding: .65rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #f9fafb;
      color: #374151;
      font-size: .8125rem;
      font-weight: 700;
      line-height: 1.35;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .model-flow i {
      color: #6b7280;
      font-size: 1rem;
    }

    .model-flow .blocked-step {
      border-color: #fecaca;
      background: #fef2f2;
      color: #991b1b;
    }

    .model-flow .free-step {
      border-color: #bbf7d0;
      background: #ecfdf5;
      color: #047857;
    }

    .thread-cost-image {
      display: block;
      width: 100%;
      height: auto;
      margin-top: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #f8fafc;
    }

    .cost-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .cost-grid div {
      min-width: 0;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
      display: grid;
      gap: .5rem;
      align-content: start;
    }

    pre {
      overflow-x: auto;
      margin: 1rem 0 0;
      max-width: 100%;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      padding: 1rem;
      border-radius: .5rem;
      background: #111827;
      color: #f9fafb;
      font-size: .875rem;
      line-height: 1.6;
    }

    @media (max-width: 900px) {
      .os-diagram {
        grid-template-columns: 1fr;
      }

      .process-body {
        grid-template-columns: 1fr;
      }

      .thread-list {
        grid-template-columns: 1fr;
      }

      .jetty-flowchart,
      .pool-flow,
      .jetty-models,
      .model-flow,
      .cost-grid {
        grid-template-columns: 1fr;
      }

      .pool-step,
      .response-step {
        grid-column: auto;
      }

      .arrow,
      .flow-arrow,
      .mini-arrow,
      .model-flow i {
        transform: rotate(90deg);
        justify-self: center;
      }
    }
  `]
})
export class ThreadPageComponent {
  protected isThreadDetailOpen = false;

  protected readonly threadExampleCode = `import java.time.LocalTime
import java.time.format.DateTimeFormatter
import kotlin.concurrent.thread

val timeFormat = DateTimeFormatter.ofPattern("HH:mm:ss.SSS")

fun log(message: String) {
    println("\${LocalTime.now().format(timeFormat)} | \$message")
}

fun main() {
    log("Main starts on \${Thread.currentThread().name}")

    val workerA = thread(name = "worker-a") {
        repeat(3) { step ->
            log("Worker A step \${step + 1} on \${Thread.currentThread().name}")
            Thread.sleep(300)
        }
    }

    val workerB = thread(name = "worker-b") {
        repeat(3) { step ->
            log("Worker B step \${step + 1} on \${Thread.currentThread().name}")
            Thread.sleep(300)
        }
    }

    workerA.join()
    workerB.join()

    log("Main finishes after both threads complete")
}`;

  protected openThreadDetail(): void {
    this.isThreadDetailOpen = true;
  }
}
