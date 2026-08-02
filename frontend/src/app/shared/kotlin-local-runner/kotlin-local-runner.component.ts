import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { timeout } from 'rxjs';
import 'chart.js/auto';
import type { ChartData, ChartDataset, ChartOptions } from 'chart.js';

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

type TimelineStatus = 'QUEUED' | 'RUNNING' | 'YIELDING' | 'FINISHED';
type FloatingBarPoint = [number, number] | null;

interface TimelineEvent {
  group: string;
  startMillis: number;
  durationMillis: number;
  endMillis: number;
  thread: string;
  coroutine: string;
  status: TimelineStatus;
  state: string;
}

interface TimelineChart {
  title: string;
  totalMillis: number;
  height: string;
  data: ChartData<'bar', FloatingBarPoint[], string>;
  options: ChartOptions<'bar'>;
}

@Component({
  selector: 'app-kotlin-local-runner',
  standalone: true,
  imports: [ButtonModule, ChartModule, FormsModule, SliderModule, ToggleSwitchModule],
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

          <div
            class="code-surface"
            [style.--code-font-size.px]="codeFontSizePx"
          >
            <pre
              #highlightedCode
              class="code-highlight"
              aria-hidden="true"
            ><code [innerHTML]="highlightedEditableCode"></code></pre>
            <textarea
              class="code-editor"
              spellcheck="false"
              [ngModel]="editableCode"
              (ngModelChange)="updateEditableCode($event)"
              (scroll)="syncCodeScroll($event)"
              aria-label="Editable Kotlin code">
            </textarea>
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

          <div class="output-content">
            <pre [style.--output-font-size.px]="outputFontSizePx">{{ outputText() }}</pre>
          </div>
        </section>
      </div>

      @if (timelineCharts().length > 0) {
        <div class="timeline-charts">
          @for (chart of timelineCharts(); track chart.title) {
            <section class="timeline-chart">
              <header>
                <strong>{{ chart.title }}</strong>
                <span>{{ chart.totalMillis }} ms</span>
              </header>
              <p-chart
                type="bar"
                [data]="chart.data"
                [options]="chart.options"
                [height]="chart.height"
              />
            </section>
          }
        </div>
      }
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
      border: 1px solid #d8e2ee;
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

    .code-panel .panel-header {
      border-bottom-color: #d8e2ee;
      background: #f8fafc;
    }

    .code-panel .panel-header strong,
    .code-panel .common-functions-toggle,
    .code-panel .font-size-control {
      color: #334155;
    }

    .code-panel .font-size-control input {
      border-color: #cbd5e1;
      background: #ffffff;
      color: #111827;
    }

    .code-panel .font-size-control input:focus {
      border-color: #2563eb;
      outline: 2px solid #bfdbfe;
    }

    :host ::ng-deep .code-panel .p-button {
      color: #334155;
    }

    :host ::ng-deep .code-panel .p-button:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .code-surface {
      position: relative;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .code-highlight,
    .code-editor {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      padding: 1rem;
      border: 0;
      border-radius: 0;
      background:
        linear-gradient(90deg, rgb(37 99 235 / 10%) 0 3px, transparent 3px),
        #eef3f8;
      color: #1f2937;
      box-shadow: none;
      caret-color: #111827;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: var(--code-font-size, .875rem);
      line-height: 1.65;
      tab-size: 4;
      white-space: pre;
    }

    .code-highlight {
      margin: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .code-highlight code {
      color: #1f2937;
    }

    .code-editor {
      overflow: auto;
      background: transparent;
      color: transparent;
      resize: none;
      -webkit-text-fill-color: transparent;
    }

    .code-editor:focus {
      outline: 2px solid #bfdbfe;
      outline-offset: -2px;
    }

    .code-editor::selection {
      background: rgb(147 197 253 / 45%);
      color: #111827;
    }

    :host ::ng-deep .token-keyword {
      color: #b45309;
      font-weight: 700;
    }

    :host ::ng-deep .token-type {
      color: #7c3aed;
    }

    :host ::ng-deep .token-function {
      color: #1f2937;
      font-weight: 700;
    }

    :host ::ng-deep .token-variable {
      color: #4c1d95;
    }

    :host ::ng-deep .token-string {
      color: #15803d;
    }

    :host ::ng-deep .token-number {
      color: #0369a1;
    }

    :host ::ng-deep .token-comment {
      color: #6b7280;
      font-style: italic;
    }

    :host ::ng-deep .token-annotation {
      color: #854d0e;
    }

    :host ::ng-deep .token-operator {
      color: #1f2937;
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

    .output-content {
      flex: 1;
      min-height: 0;
      overflow: auto;
      background: #0f172a;
      box-shadow: inset 0 0 0 1px #1e293b;
    }

    .output-content pre {
      overflow: auto;
      min-height: 0;
      margin: 0;
      padding: 1rem;
      background: transparent;
      color: #e5e7eb;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: var(--output-font-size, .875rem);
      line-height: 1.6;
      white-space: pre;
    }

    .timeline-charts {
      display: grid;
      gap: 1rem;
      padding: 0;
      background: #f8fafc;
    }

    .timeline-chart {
      overflow: hidden;
      border: 1px solid #d8e2ee;
      border-radius: .5rem;
      background: #ffffff;
    }

    .timeline-chart header {
      min-height: 2.5rem;
      padding: .5rem .75rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      color: #334155;
    }

    .timeline-chart header strong {
      font-size: .8125rem;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .timeline-chart header span {
      color: #64748b;
      font-size: .8125rem;
      font-weight: 700;
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
  @ViewChild('highlightedCode') private highlightedCode?: ElementRef<HTMLPreElement>;

  private readonly runnerUrl = 'http://127.0.0.1:3001/run-kotlin';
  private readonly runTimeoutMs = 600000;
  private readonly refreshIntervalMs = 3000;
  private activeRunId: string | undefined;
  private pollTimer: number | undefined;
  private baseCode = '';
  private baseRunnableCode = '';

  protected editableCode = '';
  protected highlightedEditableCode = '';
  protected readonly expandedPane = signal<'none' | 'code' | 'output'>('none');
  protected readonly isRunning = signal(false);
  protected readonly snapshot = signal<KotlinRunSnapshot | undefined>(undefined);
  protected readonly outputText = signal('Runner output will appear here.');
  protected readonly timelineCharts = signal<TimelineChart[]>([]);
  protected codePanePercent = 50;
  protected codeFontSizePx = 12;
  protected outputFontSizePx = 12;
  private readonly keywords = new Set([
    'as',
    'break',
    'catch',
    'class',
    'companion',
    'continue',
    'do',
    'else',
    'false',
    'finally',
    'for',
    'fun',
    'if',
    'import',
    'in',
    'interface',
    'is',
    'null',
    'object',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'suspend',
    'throw',
    'true',
    'try',
    'typealias',
    'val',
    'var',
    'when',
    'while'
  ]);

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] || changes['runnableCode']) {
      this.baseCode = this.code;
      this.baseRunnableCode = this.runnableCode;
    }

    if (changes['code']) {
      this.updateEditableCode(this.code);
      this.clearPolling();
      this.activeRunId = undefined;
      this.isRunning.set(false);
      this.snapshot.set(undefined);
      this.outputText.set('Runner output will appear here.');
      this.timelineCharts.set([]);
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
    this.timelineCharts.set([]);

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
        this.pollTimer = window.setInterval(() => this.pollRun(), this.refreshIntervalMs);
      },
      error: (error) => {
        this.snapshot.set(undefined);
        this.timelineCharts.set([]);
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
        this.timelineCharts.set([]);
      }
    });
  }

  protected updateEditableCode(code: string): void {
    this.editableCode = code;
    this.highlightedEditableCode = this.highlightKotlin(code);
  }

  protected syncCodeScroll(event: Event): void {
    const textArea = event.target as HTMLTextAreaElement;
    const highlightedCode = this.highlightedCode?.nativeElement;

    if (!highlightedCode) {
      return;
    }

    highlightedCode.scrollTop = textArea.scrollTop;
    highlightedCode.scrollLeft = textArea.scrollLeft;
  }

  protected toggleExpandedPane(pane: 'code' | 'output'): void {
    this.expandedPane.update((expandedPane) => expandedPane === pane ? 'none' : pane);
  }

  private get codeToRun(): string {
    if (!this.baseRunnableCode || this.baseRunnableCode === this.baseCode) {
      return this.editableCode;
    }

    if (this.baseRunnableCode.endsWith(this.baseCode)) {
      const supportCode = this.baseRunnableCode.slice(0, -this.baseCode.length);

      return `${supportCode}${this.editableCode}`;
    }

    return this.editableCode;
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
      this.timelineCharts.set(this.parseTimelineCharts(snapshot.stdout));
    } else {
      this.timelineCharts.set([]);
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

  private parseTimelineCharts(output: string): TimelineChart[] {
    const threadEvents = this.parseHistorySection(output, 'Tracked thread history');
    const coroutineEvents = this.parseHistorySection(output, 'Tracked coroutine history');
    const charts: TimelineChart[] = [];

    if (threadEvents.length > 0) {
      charts.push(this.buildTimelineChart('Thread Timeline', threadEvents));
    }

    if (coroutineEvents.length > 0) {
      charts.push(this.buildTimelineChart('Coroutine Timeline', coroutineEvents));
    }

    return charts;
  }

  private parseHistorySection(output: string, sectionTitle: string): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const lines = output.split(/\r?\n/);
    let isInSection = false;
    let currentGroup = '';

    for (const line of lines) {
      if (line.trim() === sectionTitle) {
        isInSection = true;
        currentGroup = '';
        continue;
      }

      if (isInSection && line.trim().startsWith('Tracked ') && line.trim() !== sectionTitle) {
        break;
      }

      if (!isInSection) {
        continue;
      }

      const groupMatch = line.match(/^(Thread|Coroutine):\s+(.+)$/);

      if (groupMatch) {
        currentGroup = groupMatch[2].trim();
        continue;
      }

      const event = this.parseHistoryEvent(line, currentGroup);

      if (event) {
        events.push(event);
      }
    }

    return events;
  }

  private parseHistoryEvent(line: string, group: string): TimelineEvent | undefined {
    if (!group || !line.startsWith('  ')) {
      return undefined;
    }

    const parts = line.trim().split(' | ');

    if (parts.length < 7 || !parts[1].startsWith('start=') || !parts[2].startsWith('duration=')) {
      return undefined;
    }

    const startMillis = Number.parseInt(parts[1].replace('start=', '').replace('ms', ''), 10);
    const durationMillis = Number.parseInt(parts[2].replace('duration=', '').replace('ms', ''), 10);
    const status = parts[5] as TimelineStatus;

    if (!Number.isFinite(startMillis) || !Number.isFinite(durationMillis) || !this.isTimelineStatus(status)) {
      return undefined;
    }

    return {
      group,
      startMillis,
      durationMillis,
      endMillis: startMillis + durationMillis,
      thread: parts[3],
      coroutine: parts[4],
      status,
      state: parts.slice(6).join(' | ')
    };
  }

  private buildTimelineChart(title: string, events: TimelineEvent[]): TimelineChart {
    const labels = Array.from(new Set(events.map((event) => event.group)));
    const totalMillis = Math.max(
      1,
      ...events.map((event) => event.endMillis)
    );
    const datasets = events.map((event): ChartDataset<'bar', FloatingBarPoint[]> => ({
      label: event.status,
      data: labels.map((label) => label === event.group ? [event.startMillis, Math.max(event.endMillis, event.startMillis + 1)] : null),
      backgroundColor: this.statusColor(event.status),
      borderColor: this.statusBorderColor(event.status),
      borderWidth: 1,
      borderSkipped: false,
      borderRadius: 4,
      barPercentage: 0.72,
      categoryPercentage: 0.82
    }));

    return {
      title,
      totalMillis,
      height: `${Math.max(220, labels.length * 42 + 92)}px`,
      data: {
        labels,
        datasets
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const event = events[context.datasetIndex];

                return `${event.status} ${event.startMillis}-${event.endMillis}ms | ${event.thread} | ${event.coroutine}`;
              },
              afterLabel: (context) => events[context.datasetIndex].state
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: totalMillis,
            title: {
              display: true,
              text: 'milliseconds'
            },
            grid: {
              color: '#e2e8f0'
            },
            ticks: {
              color: '#475569'
            }
          },
          y: {
            stacked: true,
            grid: {
              display: false
            },
            ticks: {
              color: '#334155'
            }
          }
        }
      }
    };
  }

  private isTimelineStatus(status: string): status is TimelineStatus {
    return status === 'QUEUED' || status === 'RUNNING' || status === 'YIELDING' || status === 'FINISHED';
  }

  private statusColor(status: TimelineStatus): string {
    const colors: Record<TimelineStatus, string> = {
      QUEUED: '#93c5fd',
      RUNNING: '#34d399',
      YIELDING: '#fbbf24',
      FINISHED: '#a78bfa'
    };

    return colors[status];
  }

  private statusBorderColor(status: TimelineStatus): string {
    const colors: Record<TimelineStatus, string> = {
      QUEUED: '#2563eb',
      RUNNING: '#059669',
      YIELDING: '#d97706',
      FINISHED: '#7c3aed'
    };

    return colors[status];
  }

  private clearPolling(): void {
    if (this.pollTimer === undefined) {
      return;
    }

    window.clearInterval(this.pollTimer);
    this.pollTimer = undefined;
  }

  private highlightKotlin(code: string): string {
    const tokenPattern = /("""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])'|\/\/.*|\/\*[\s\S]*?\*\/|@[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|[{}()[\].,;:+\-*/%=!<>?&|]+)/g;
    let highlighted = '';
    let cursor = 0;

    for (const match of code.matchAll(tokenPattern)) {
      const token = match[0];
      const index = match.index ?? 0;

      highlighted += this.escapeHtml(code.slice(cursor, index));
      highlighted += this.renderToken(token, code.slice(index + token.length));
      cursor = index + token.length;
    }

    highlighted += this.escapeHtml(code.slice(cursor));
    return highlighted;
  }

  private renderToken(token: string, remainingCode: string): string {
    const escapedToken = this.escapeHtml(token);

    if (token.startsWith('//') || token.startsWith('/*')) {
      return this.wrapToken(escapedToken, 'comment');
    }

    if (token.startsWith('"') || token.startsWith("'")) {
      return this.wrapToken(escapedToken, 'string');
    }

    if (token.startsWith('@')) {
      return this.wrapToken(escapedToken, 'annotation');
    }

    if (/^\d/.test(token)) {
      return this.wrapToken(escapedToken, 'number');
    }

    if (this.keywords.has(token)) {
      return this.wrapToken(escapedToken, 'keyword');
    }

    if (/^[A-Z]/.test(token)) {
      return this.wrapToken(escapedToken, 'type');
    }

    if (/^[A-Za-z_]\w*$/.test(token) && remainingCode.trimStart().startsWith('(')) {
      return this.wrapToken(escapedToken, 'function');
    }

    if (/^[{}()[\].,;:+\-*/%=!<>?&|]+$/.test(token)) {
      return this.wrapToken(escapedToken, 'operator');
    }

    if (/^[a-z_]\w*$/.test(token)) {
      return this.wrapToken(escapedToken, 'variable');
    }

    return escapedToken;
  }

  private wrapToken(token: string, className: string): string {
    return `<span class="token-${className}">${token}</span>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
