import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
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
  imports: [ButtonModule, FormsModule, KotlinCodeViewerComponent, SliderModule, ToggleSwitchModule],
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

      <div class="workspace-controls">
        <span>Code {{ codePanePercent }}%</span>
        <p-slider
          [(ngModel)]="codePanePercent"
          [min]="25"
          [max]="75"
          [step]="5"
          [disabled]="expandedPane() !== 'none'"
          styleClass="width-slider"
          ariaLabel="Adjust code and output width"
        />
        <span>Output {{ 100 - codePanePercent }}%</span>
      </div>

      <div
        class="runner-workspace"
        [class.code-expanded]="expandedPane() === 'code'"
        [class.output-expanded]="expandedPane() === 'output'"
        [style.--code-pane-percent]="codePanePercent + '%'"
        [style.--output-pane-percent]="100 - codePanePercent + '%'"
      >
        <section class="code-panel" aria-label="Kotlin code">
          <header class="panel-header">
            <div>
              <strong>Kotlin</strong>
              @if (showCommonFunctionsToggle) {
                <label class="common-functions-toggle" for="runner-common-functions-toggle">
                  <span>Support code</span>
                  <p-toggleswitch
                    inputId="runner-common-functions-toggle"
                    [ngModel]="showCommonFunctions"
                    (ngModelChange)="showCommonFunctionsChange.emit($event)"
                    ariaLabel="Show common functions in Kotlin code"
                    size="small"
                  />
                </label>
              }
            </div>

            <div class="panel-actions">
              <label class="font-size-control" for="code-font-size">
                <span>Font</span>
                <input
                  id="code-font-size"
                  type="number"
                  min="12"
                  max="22"
                  step="1"
                  [(ngModel)]="codeFontSizePx"
                  aria-label="Kotlin code font size"
                />
              </label>

              <button
                pButton
                type="button"
                [icon]="expandedPane() === 'code' ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
                severity="secondary"
                [text]="true"
                [rounded]="true"
                [attr.aria-label]="expandedPane() === 'code' ? 'Restore code and output view' : 'Expand Kotlin code'"
                (click)="toggleExpandedPane('code')">
              </button>
            </div>
          </header>

          <div class="code-surface" [style.--code-font-size.px]="codeFontSizePx">
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
          </div>
        </section>

        <section class="output-panel" aria-label="Kotlin runner output">
          <header class="panel-header">
            <div>
              <strong>Output</strong>
              @if (snapshot(); as runResult) {
                <span>
                  {{ runResult.durationMs }} ms · {{ runResult.status }}
                  @if (runResult.status !== 'running') {
                    · exit {{ runResult.exitCode ?? runResult.signal ?? 'unknown' }}
                  }
                </span>
              }
            </div>

            <div class="panel-actions">
              <label class="font-size-control" for="output-font-size">
                <span>Font</span>
                <input
                  id="output-font-size"
                  type="number"
                  min="12"
                  max="22"
                  step="1"
                  [(ngModel)]="outputFontSizePx"
                  aria-label="Output font size"
                />
              </label>

              <button
                pButton
                type="button"
                [icon]="expandedPane() === 'output' ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
                severity="secondary"
                [text]="true"
                [rounded]="true"
                [attr.aria-label]="expandedPane() === 'output' ? 'Restore code and output view' : 'Expand output'"
                (click)="toggleExpandedPane('output')">
              </button>
            </div>
          </header>

          <pre [style.--output-font-size.px]="outputFontSizePx">{{ outputText() }}</pre>
        </section>
      </div>
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

    .workspace-controls {
      min-height: 3rem;
      display: grid;
      grid-template-columns: auto minmax(12rem, 24rem) auto;
      align-items: center;
      justify-content: start;
      gap: .75rem;
      padding: .75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
      color: #4b5563;
      font-size: .875rem;
      font-weight: 700;
    }

    :host ::ng-deep .width-slider {
      width: 100%;
    }

    .runner-workspace {
      --code-pane-percent: 50%;
      --output-pane-percent: 50%;
      height: 90vh;
      display: grid;
      grid-template-columns: minmax(18rem, var(--code-pane-percent)) minmax(18rem, var(--output-pane-percent));
      gap: 1rem;
      min-width: 0;
    }

    .runner-workspace.code-expanded,
    .runner-workspace.output-expanded {
      grid-template-columns: minmax(0, 1fr);
    }

    .runner-workspace.code-expanded .output-panel,
    .runner-workspace.output-expanded .code-panel {
      display: none;
    }

    .code-panel,
    .code-editor {
      min-width: 0;
    }

    .code-panel,
    .output-panel {
      height: 90vh;
      overflow: hidden;
      border-radius: .5rem;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .code-panel {
      background: #eef3f8;
    }

    .panel-header {
      min-height: 2.75rem;
      padding: .35rem .5rem .35rem .875rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      background: #ffffff;
    }

    .panel-header strong {
      color: inherit;
      font-size: .8125rem;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .panel-header > div {
      display: flex;
      align-items: center;
      gap: .75rem;
      min-width: 0;
    }

    .panel-actions {
      display: flex;
      align-items: center;
      gap: .5rem;
    }

    .font-size-control {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      color: #4b5563;
      font-size: .8125rem;
      font-weight: 700;
    }

    .font-size-control input {
      width: 3.25rem;
      min-height: 2rem;
      padding: .25rem .35rem;
      border: 1px solid #d1d5db;
      border-radius: .375rem;
      color: #111827;
      font: inherit;
    }

    .font-size-control input:focus {
      border-color: #2563eb;
      outline: 2px solid #bfdbfe;
      outline-offset: 1px;
    }

    .common-functions-toggle {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      color: #4b5563;
      font-size: .8125rem;
      font-weight: 700;
      text-transform: none;
    }

    .code-surface {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    :host ::ng-deep app-kotlin-code-viewer,
    :host ::ng-deep app-kotlin-code-viewer .code-viewer {
      height: 100%;
    }

    :host ::ng-deep app-kotlin-code-viewer .code-viewer {
      margin-top: 0;
      border: 0;
      border-radius: 0;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep app-kotlin-code-viewer .code-toolbar {
      display: none;
    }

    :host ::ng-deep app-kotlin-code-viewer pre {
      flex: 1;
      min-height: 0;
      overflow: auto;
      background: #eef3f8;
      color: #1f2937;
      box-shadow: inset 0 0 0 1px #d8e2ee;
      font-size: var(--code-font-size, .875rem);
    }

    :host ::ng-deep app-kotlin-code-viewer .token-keyword {
      color: #b45309;
    }

    :host ::ng-deep app-kotlin-code-viewer .token-type,
    :host ::ng-deep app-kotlin-code-viewer .token-function,
    :host ::ng-deep app-kotlin-code-viewer .token-operator {
      color: #1f2937;
    }

    :host ::ng-deep app-kotlin-code-viewer .token-variable {
      color: #7c3aed;
    }

    :host ::ng-deep app-kotlin-code-viewer .token-string {
      color: #15803d;
    }

    :host ::ng-deep app-kotlin-code-viewer .token-number {
      color: #0369a1;
    }

    :host ::ng-deep app-kotlin-code-viewer .token-comment {
      color: #6b7280;
    }

    :host ::ng-deep app-kotlin-code-viewer .token-annotation {
      color: #854d0e;
    }

    .code-editor {
      width: 100%;
      height: 100%;
      padding: 1rem;
      border: 0;
      border-radius: 0;
      background: #eef3f8;
      color: #111827;
      box-shadow: inset 0 0 0 1px #d8e2ee;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: var(--code-font-size, .875rem);
      line-height: 1.6;
      resize: none;
      tab-size: 4;
    }

    .code-editor:focus {
      border-color: #2563eb;
      outline: 2px solid #bfdbfe;
      outline-offset: 1px;
    }

    .output-panel {
      background: #111827;
    }

    .output-panel span {
      color: #d1d5db;
      font-size: .8125rem;
      font-weight: 700;
      white-space: nowrap;
    }

    pre {
      overflow: auto;
      flex: 1;
      min-height: 0;
      margin: 0;
      padding: 1rem;
      background: #0f172a;
      color: #e5e7eb;
      box-shadow: inset 0 0 0 1px #1e293b;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: var(--output-font-size, .875rem);
      line-height: 1.6;
      white-space: pre;
    }

    @media (max-width: 760px) {
      .runner-toolbar,
      .panel-header {
        align-items: stretch;
        flex-direction: column;
      }

      .workspace-controls {
        grid-template-columns: 1fr;
      }

      .runner-workspace {
        height: auto;
        grid-template-columns: 1fr;
      }

      .runner-workspace.code-expanded,
      .runner-workspace.output-expanded {
        grid-template-columns: 1fr;
      }

      .code-panel,
      .output-panel {
        height: 90vh;
      }
    }
  `]
})
export class KotlinLocalRunnerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) code = '';
  @Input() runnableCode = '';
  @Input() showCommonFunctionsToggle = false;
  @Input() showCommonFunctions = false;
  @Output() showCommonFunctionsChange = new EventEmitter<boolean>();

  private readonly runnerUrl = 'http://127.0.0.1:3001/run-kotlin';
  private readonly runTimeoutMs = 600000;
  private activeRunId: string | undefined;
  private pollTimer: number | undefined;

  protected editableCode = '';
  protected readonly isEditingCode = signal(false);
  protected readonly expandedPane = signal<'none' | 'code' | 'output'>('none');
  protected readonly isRunning = signal(false);
  protected readonly snapshot = signal<KotlinRunSnapshot | undefined>(undefined);
  protected readonly outputText = signal('Runner output will appear here.');
  protected codePanePercent = 50;
  protected codeFontSizePx = 12;
  protected outputFontSizePx = 12;

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
      code: this.codeToRun,
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

  protected toggleExpandedPane(pane: 'code' | 'output'): void {
    this.expandedPane.update((expandedPane) => expandedPane === pane ? 'none' : pane);
  }

  private get codeToRun(): string {
    if (this.isEditingCode()) {
      return this.editableCode;
    }

    return this.runnableCode || this.editableCode;
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
