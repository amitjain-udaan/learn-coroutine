import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { timeout } from 'rxjs';

import { KotlinCodeViewerComponent } from '../kotlin-code-viewer/kotlin-code-viewer.component';

interface KotlinRunStartResult {
  runId: string;
  statusUrl: string;
}

interface KotlinRunSnapshot {
  runId: string;
  status: 'running' | 'finished' | 'failed' | 'cancelled' | 'timed-out';
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  aborted: boolean;
  outputTruncated: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
  error?: string;
}

@Component({
  selector: 'app-kotlin-local-runner',
  standalone: true,
  imports: [ButtonModule, FormsModule, KotlinCodeViewerComponent],
  template: `
    <section class="runner">
      <div class="runner-toolbar">
        <div>
          <span class="runner-label">Local JVM runner</span>
          <p>Runs through Maven on your machine, outside the embedded Kotlin Playground limits.</p>
        </div>

        <button
          pButton
          type="button"
          icon="pi pi-play"
          label="Run"
          [loading]="isRunning()"
          [disabled]="isRunning()"
          (click)="runCode()">
        </button>

        <button
          pButton
          type="button"
          icon="pi pi-stop"
          label="Stop"
          severity="secondary"
          [disabled]="!isRunning()"
          (click)="stopRun()">
        </button>

        <button
          pButton
          type="button"
          [icon]="isEditingCode() ? 'pi pi-eye' : 'pi pi-pencil'"
          [label]="isEditingCode() ? 'View' : 'Edit'"
          severity="secondary"
          (click)="toggleCodeMode()">
        </button>
      </div>

      @if (isEditingCode()) {
        <textarea
          class="code-editor"
          spellcheck="false"
          [(ngModel)]="editableCode"
          aria-label="Editable Kotlin code">
        </textarea>
      } @else {
        <app-kotlin-code-viewer [code]="editableCode" />
      }

      <section class="output-panel" aria-label="Kotlin runner output">
        <header>
          <strong>Output</strong>
          @if (snapshot(); as runResult) {
            <span>
              {{ runResult.durationMs }} ms · {{ runResult.status }}
              @if (runResult.status !== 'running') {
                · exit {{ runResult.exitCode ?? runResult.signal ?? 'unknown' }}
              }
            </span>
          }
        </header>

        <pre>{{ outputText() }}</pre>
      </section>
    </section>
  `,
  styles: [`
    .runner {
      display: grid;
      gap: 1rem;
    }

    .runner-toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
    }

    .runner-label {
      display: block;
      margin-bottom: .35rem;
      color: #111827;
      font-weight: 800;
    }

    .runner-toolbar > div {
      flex: 1;
    }

    p {
      margin: 0;
      color: #4b5563;
      line-height: 1.6;
    }

    .code-editor {
      width: 100%;
      min-height: 34rem;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #111827;
      color: #f9fafb;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: .875rem;
      line-height: 1.6;
      resize: vertical;
      tab-size: 4;
    }

    .code-editor:focus {
      border-color: #2563eb;
      outline: 2px solid #bfdbfe;
      outline-offset: 1px;
    }

    .output-panel {
      overflow: hidden;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
    }

    .output-panel header {
      min-height: 2.75rem;
      padding: .75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .output-panel span {
      color: #6b7280;
      font-size: .8125rem;
      font-weight: 700;
    }

    pre {
      overflow: auto;
      min-height: 12rem;
      max-height: 38rem;
      margin: 0;
      padding: 1rem;
      background: #0f172a;
      color: #e5e7eb;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: .875rem;
      line-height: 1.6;
      white-space: pre;
    }

    @media (max-width: 760px) {
      .runner-toolbar,
      .output-panel header {
        align-items: stretch;
        flex-direction: column;
      }
    }
  `]
})
export class KotlinLocalRunnerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) code = '';

  private readonly runnerUrl = 'http://127.0.0.1:3001/run-kotlin';
  private readonly runTimeoutMs = 600000;
  private activeRunId: string | undefined;
  private pollTimer: number | undefined;

  protected editableCode = '';
  protected readonly isEditingCode = signal(false);
  protected readonly isRunning = signal(false);
  protected readonly snapshot = signal<KotlinRunSnapshot | undefined>(undefined);
  protected readonly outputText = signal('Runner output will appear here.');

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code']) {
      this.editableCode = this.code;
      this.clearPolling();
      this.activeRunId = undefined;
      this.isEditingCode.set(false);
      this.isRunning.set(false);
      this.snapshot.set(undefined);
      this.outputText.set('Runner output will appear here.');
    }
  }

  ngOnDestroy(): void {
    this.clearPolling();
  }

  protected runCode(): void {
    this.clearPolling();
    this.isRunning.set(true);
    this.activeRunId = undefined;
    this.snapshot.set(undefined);
    this.outputText.set('Starting Kotlin through local JVM runner...');

    this.http.post<KotlinRunStartResult>(this.runnerUrl, {
      code: this.editableCode,
      timeoutMs: this.runTimeoutMs
    }).pipe(
      timeout(30000)
    ).subscribe({
      next: (result) => {
        this.activeRunId = result.runId;
        this.outputText.set('Run started. Waiting for output...');
        this.pollRun();
        this.pollTimer = window.setInterval(() => this.pollRun(), 1000);
      },
      error: (error) => {
        this.snapshot.set(undefined);
        this.outputText.set([
          'Could not reach the local Kotlin runner.',
          '',
          'Start it with:',
          'npm run kotlin-runner',
          '',
          'Long-running programs stop after about 10 minutes.',
          'Restart the runner after code changes so it uses the polling API.',
          '',
          error?.message ?? String(error)
        ].join('\n'));
        this.isRunning.set(false);
      }
    });
  }

  protected stopRun(): void {
    const runId = this.activeRunId;

    if (!runId) {
      return;
    }

    this.http.delete<KotlinRunSnapshot>(`${this.runnerUrl}/${runId}`).pipe(
      timeout(10000)
    ).subscribe({
      next: (snapshot) => {
        this.applySnapshot(snapshot);
      },
      error: () => {
        this.clearPolling();
        this.isRunning.set(false);
      }
    });
  }

  protected toggleCodeMode(): void {
    this.isEditingCode.update((isEditing) => !isEditing);
  }

  private pollRun(): void {
    const runId = this.activeRunId;

    if (!runId) {
      return;
    }

    this.http.get<KotlinRunSnapshot>(`${this.runnerUrl}/${runId}`).pipe(
      timeout(10000)
    ).subscribe({
      next: (snapshot) => this.applySnapshot(snapshot),
      error: (error) => {
        this.clearPolling();
        this.isRunning.set(false);
        this.outputText.set([
          this.outputText(),
          '',
          'Could not poll the local Kotlin runner.',
          error?.message ?? String(error)
        ].filter(Boolean).join('\n'));
      }
    });
  }

  private applySnapshot(snapshot: KotlinRunSnapshot): void {
    this.snapshot.set(snapshot);
    this.outputText.set(this.formatOutput(snapshot));

    if (snapshot.status !== 'running') {
      this.clearPolling();
      this.isRunning.set(false);
    }
  }

  private formatOutput(snapshot: KotlinRunSnapshot): string {
    if (snapshot.error) {
      return snapshot.error;
    }

    const lines = [
      snapshot.stdout.trimEnd(),
      snapshot.stderr.trimEnd()
    ].filter(Boolean);

    if (snapshot.status === 'running' && lines.length === 0) {
      lines.push('Running... waiting for output.');
    }

    if (snapshot.timedOut) {
      lines.push('Process timed out and was stopped.');
    }

    if (snapshot.aborted) {
      lines.push('Process was stopped.');
    }

    if (snapshot.outputTruncated) {
      lines.push('Output was truncated by the local runner.');
    }

    return lines.join('\n\n') || 'Program finished with no output.';
  }

  private clearPolling(): void {
    if (this.pollTimer === undefined) {
      return;
    }

    window.clearInterval(this.pollTimer);
    this.pollTimer = undefined;
  }
}
