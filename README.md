# Learn Coroutine

Learning project for Kotlin concurrency/coroutine concepts with an Angular frontend and local Kotlin JVM examples.

## Project Layout

- `frontend/` - Angular app for lessons and the Kotlin Lab UI.
- `coroutine-examples/` - Maven/Kotlin project used by the local Kotlin runner.

## Requirements

- Node.js 22
- npm 10+
- Java 21
- Maven

## Run The App

Open two terminals.

### 1. Start Angular

```bash
cd frontend
nvm use 22
npm start -- --host 127.0.0.1
```

Angular runs at:

```text
http://127.0.0.1:4200/
```

### 2. Start Kotlin Runner

```bash
cd frontend
nvm use 22
npm run kotlin-runner
```

The local Kotlin runner runs at:

```text
http://127.0.0.1:3001
```

The Kotlin Lab sends selected lesson programs to this runner so examples execute on the local JVM instead of the embedded Kotlin Playground.

If the UI keeps showing `Starting Kotlin through local JVM runner...`, restart the runner terminal after code changes. A successful request prints start/finish lines in the runner terminal.

Quick runner check:

```bash
curl -sS -X POST http://127.0.0.1:3001/run-kotlin \
  -H 'Content-Type: application/json' \
  --data '{"code":"fun main() { println(\"Hello, world!\") }","timeoutMs":600000}'
```

That start call returns a `runId`. Poll it to read the latest output:

```bash
curl -sS http://127.0.0.1:3001/run-kotlin/1
```

## Useful Commands

From `frontend/`:

```bash
npm run build
npx tsc -p tsconfig.app.json --noEmit
npm run kotlin-runner
```

From `coroutine-examples/`:

```bash
mvn -q -DskipTests compile exec:java
```
