import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { BasicsProgramGroupComponent } from '../../shared/kotlin-program-groups/basics-program-group.component';
import { SequentialVsConcurrentProgramGroupComponent } from '../../shared/kotlin-program-groups/sequential-vs-concurrent-program-group.component';
import { KotlinLocalRunnerComponent } from '../../shared/kotlin-local-runner/kotlin-local-runner.component';
import {
  BuilderProgramConfig,
  DEFAULT_BUILDER_PROGRAM_CONFIG,
  KOTLIN_PROGRAM_GROUPS,
  KOTLIN_PROGRAMS,
  KotlinProgram,
  KotlinProgramGroup,
  buildKotlinProgramCode
} from '../../shared/kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-kotlin-editor-page',
  standalone: true,
  imports: [
    AccordionModule,
    BasicsProgramGroupComponent,
    FormsModule,
    KotlinLocalRunnerComponent,
    SelectModule,
    SequentialVsConcurrentProgramGroupComponent,
    TagModule
  ],
  template: `
    <section class="editor-page">
      <header class="page-header">
        <p-tag value="Kotlin Lab" severity="success" />
        <h2>Kotlin Playground</h2>
        <p>
          Select one of the lesson programs and run it directly in the playground.
        </p>
      </header>

      <div class="picker-grid">
        <div class="program-picker">
          <label for="group-select">Group</label>
          <p-select
            inputId="group-select"
            [options]="programGroups"
            [(ngModel)]="selectedGroupId"
            optionLabel="label"
            optionValue="id"
            placeholder="Select a group"
            styleClass="program-select"
            (onChange)="handleGroupChange()"
          />
        </div>

        <div class="program-picker">
          <label for="program-select">Program</label>
          <p-select
            inputId="program-select"
            [options]="filteredPrograms"
            [(ngModel)]="selectedProgramId"
            optionLabel="label"
            optionValue="id"
            placeholder="Select a program"
            styleClass="program-select"
          />
        </div>

      </div>

      <p-accordion value="introduction" styleClass="editor-sections">
        <p-accordion-panel value="introduction">
          <p-accordion-header>Introduction</p-accordion-header>
          <p-accordion-content>
            <section class="introduction-panel" aria-label="Program introduction">
              <div class="intro-copy">
                <span class="section-label">{{ selectedIntroduction.step }}</span>
                <h3>{{ selectedIntroduction.title }}</h3>

                @for (paragraph of selectedIntroduction.paragraphs; track paragraph) {
                  <p>{{ paragraph }}</p>
                }
              </div>

              @if (selectedIntroduction.tasks.length > 0) {
                <div class="task-list" aria-label="Scenario task list">
                  @for (task of selectedIntroduction.tasks; track task.label) {
                    <span>{{ task.label }} <strong>{{ task.duration }}</strong></span>
                  }
                </div>
              }

              @if (selectedIntroduction.diagram; as diagram) {
                <section class="concept-diagram" [attr.aria-label]="diagram.title">
                  <header>
                    <span>{{ diagram.kicker }}</span>
                    <strong>{{ diagram.title }}</strong>
                  </header>

                  @switch (diagram.type) {
                    @case ('sequence') {
                      <div class="sequence-diagram">
                        @for (node of diagram.nodes; track node.label; let isLast = $last) {
                          <div class="diagram-node">
                            <i [class]="node.icon" aria-hidden="true"></i>
                            <span>{{ node.label }}</span>
                            <strong>{{ node.detail }}</strong>
                          </div>

                          @if (!isLast) {
                            <i class="pi pi-arrow-right diagram-arrow" aria-hidden="true"></i>
                          }
                        }
                      </div>
                    }
                    @case ('lanes') {
                      <div class="lane-diagram">
                        @for (lane of diagram.lanes; track lane.label) {
                          <div class="lane-row">
                            <strong>{{ lane.label }}</strong>
                            <div class="lane-track">
                              @for (item of lane.items; track item.label) {
                                <span
                                  [class.muted]="item.muted"
                                  [style.grid-column]="item.columnStart + ' / span ' + item.columnSpan"
                                >
                                  {{ item.label }}
                                  <small>{{ item.detail }}</small>
                                </span>
                              }
                            </div>
                          </div>
                        }

                        @if (diagram.timeline.length > 0) {
                          <div class="timeline-row" aria-label="Timeline">
                            <strong>Timeline</strong>
                            @for (item of diagram.timeline; track item.label) {
                              <span
                                [class.highlight]="item.highlight"
                                [style.grid-column]="item.columnStart + ' / span ' + item.columnSpan"
                              >
                                {{ item.label }}
                                <strong>{{ item.detail }}</strong>
                              </span>
                            }
                          </div>
                        }
                      </div>
                    }
                    @case ('assignment') {
                      <div class="assignment-diagram">
                        <div class="assignment-source">
                          <i class="pi pi-home" aria-hidden="true"></i>
                          <strong>{{ diagram.sourceLabel }}</strong>
                          <span>{{ diagram.sourceDetail }}</span>
                        </div>

                        <i class="pi pi-arrow-right diagram-arrow" aria-hidden="true"></i>

                        <div class="builder-grid">
                          @for (builder of diagram.builders; track builder.label) {
                            <div class="builder-node">
                              <i class="pi pi-user" aria-hidden="true"></i>
                              <strong>{{ builder.label }}</strong>
                              <span>{{ builder.detail }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  }
                </section>
              }

              @if (selectedIntroduction.notices.length > 0) {
                <section class="notice-list" aria-label="What to notice">
                  <strong>What to notice</strong>
                  <div>
                    @for (notice of selectedIntroduction.notices; track notice) {
                      <span><i class="pi pi-check-circle" aria-hidden="true"></i>{{ notice }}</span>
                    }
                  </div>
                </section>
              }
            </section>
          </p-accordion-content>
        </p-accordion-panel>

        <p-accordion-panel value="program">
          <p-accordion-header>Program</p-accordion-header>
          <p-accordion-content>
            <section class="program-section" aria-label="Program settings and runner">
              @switch (selectedGroupId) {
                @case ('basics') {
                  <app-basics-program-group [selectedProgram]="selectedProgram" />
                }
                @case ('sequential-vs-concurrent') {
                  <app-sequential-vs-concurrent-program-group
                    [selectedProgram]="selectedProgram"
                    [programConfig]="builderProgramConfig"
                    (programConfigChange)="builderProgramConfig = $event"
                  />
                }
              }

              <app-kotlin-local-runner
                [code]="selectedProgramCode"
                [runnableCode]="selectedProgramRunnableCode"
                [showCommonFunctionsToggle]="selectedGroupId === 'sequential-vs-concurrent'"
                [(showCommonFunctions)]="showCommonFunctions"
              />
            </section>
          </p-accordion-content>
        </p-accordion-panel>
      </p-accordion>
    </section>
  `,
  styles: [`
    .editor-page {
      display: grid;
      gap: 1rem;
    }

    .page-header {
      display: grid;
      gap: .5rem;
      max-width: 48rem;
    }

    h2 {
      margin: 0;
      color: #111827;
      font-size: 1.75rem;
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: #4b5563;
      line-height: 1.6;
    }

    .picker-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .program-picker {
      display: grid;
      gap: .5rem;
    }

    .program-picker label {
      color: #374151;
      font-size: .875rem;
      font-weight: 700;
    }

    :host ::ng-deep .program-select {
      width: 100%;
    }

    :host ::ng-deep .editor-sections {
      display: block;
    }

    .introduction-panel {
      display: grid;
      gap: 1rem;
      padding: .25rem 0;
    }

    .intro-copy {
      display: grid;
      gap: .75rem;
      max-width: 64rem;
    }

    .section-label {
      color: #2563eb;
      font-size: .75rem;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    h3 {
      margin: 0;
      color: #111827;
      font-size: 1.25rem;
      line-height: 1.35;
    }

    .concept-diagram {
      overflow: hidden;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
    }

    .concept-diagram header {
      min-height: 3rem;
      padding: .75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .concept-diagram header span {
      color: #2563eb;
      font-size: .75rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .concept-diagram header strong {
      color: #111827;
      font-size: .9375rem;
    }

    .sequence-diagram,
    .assignment-diagram {
      min-height: 8rem;
      padding: 1rem;
      display: flex;
      align-items: stretch;
      gap: .75rem;
    }

    .diagram-node,
    .assignment-source,
    .builder-node {
      min-width: 9rem;
      padding: .875rem;
      border: 1px solid #dbeafe;
      border-radius: .5rem;
      background: #eff6ff;
      display: grid;
      align-content: center;
      gap: .35rem;
    }

    .diagram-node i,
    .assignment-source i,
    .builder-node i {
      color: #2563eb;
      font-size: 1.1rem;
    }

    .diagram-node span,
    .assignment-source span,
    .builder-node span {
      color: #4b5563;
      font-size: .8125rem;
      font-weight: 700;
    }

    .diagram-node strong,
    .assignment-source strong,
    .builder-node strong {
      color: #111827;
      font-size: .9375rem;
      line-height: 1.35;
    }

    .diagram-arrow {
      align-self: center;
      color: #94a3b8;
      font-size: 1.25rem;
    }

    .lane-diagram {
      padding: 1rem;
      display: grid;
      gap: .75rem;
    }

    .lane-row {
      display: grid;
      grid-template-columns: 8rem minmax(0, 1fr);
      gap: .75rem;
      align-items: stretch;
    }

    .lane-row > strong {
      padding: .75rem;
      border-radius: .5rem;
      background: #f1f5f9;
      color: #334155;
      display: grid;
      place-items: center;
      text-align: center;
      font-size: .875rem;
    }

    .lane-track {
      display: grid;
      grid-template-columns: minmax(8rem, 2fr) minmax(8rem, 3fr) minmax(6rem, 1fr) minmax(6rem, 1fr);
      gap: .5rem;
      border-radius: .5rem;
    }

    .lane-track span {
      min-height: 3.5rem;
      padding: .75rem;
      border: 1px solid #ccfbf1;
      border-radius: .5rem;
      background: #f0fdfa;
      color: #0f766e;
      display: grid;
      gap: .25rem;
      font-weight: 800;
    }

    .lane-track span.muted {
      border-color: #e5e7eb;
      background: #f9fafb;
      color: #4b5563;
    }

    .lane-track small {
      color: inherit;
      font-size: .75rem;
      font-weight: 700;
      opacity: .85;
    }

    .timeline-row {
      margin-top: .25rem;
      padding-top: .875rem;
      border-top: 1px solid #e5e7eb;
      display: grid;
      grid-template-columns: 8rem minmax(8rem, 2fr) minmax(8rem, 3fr) minmax(6rem, 1fr) minmax(6rem, 1fr);
      gap: .5rem;
    }

    .timeline-row > strong {
      padding: .65rem .75rem;
      border-radius: .5rem;
      background: #f1f5f9;
      color: #334155;
      display: grid;
      place-items: center;
      text-align: center;
      font-size: .8125rem;
    }

    .timeline-row span {
      min-height: 3rem;
      padding: .65rem .75rem;
      border: 1px solid #e5e7eb;
      border-radius: .5rem;
      background: #f9fafb;
      color: #4b5563;
      display: grid;
      gap: .2rem;
      font-size: .8125rem;
      font-weight: 800;
    }

    .timeline-row span.highlight {
      border-color: #bfdbfe;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .timeline-row strong {
      color: inherit;
      font-size: .75rem;
      font-weight: 700;
      opacity: .9;
    }

    .builder-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: .75rem;
    }

    .task-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: .75rem;
      margin-top: .25rem;
    }

    .task-list span {
      min-height: 3rem;
      padding: .75rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #f9fafb;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      font-weight: 700;
    }

    .task-list strong {
      color: #111827;
      white-space: nowrap;
    }

    .notice-list {
      display: grid;
      gap: .75rem;
      padding: .875rem 1rem;
      border-left: .25rem solid #2563eb;
      border-radius: .5rem;
      background: #f8fafc;
    }

    .notice-list > strong {
      color: #111827;
      font-size: .9375rem;
    }

    .notice-list div {
      display: grid;
      gap: .5rem;
    }

    .notice-list span {
      color: #374151;
      display: flex;
      align-items: flex-start;
      gap: .5rem;
      line-height: 1.5;
    }

    .notice-list i {
      margin-top: .15rem;
      color: #16a34a;
    }

    .program-section {
      display: grid;
      gap: 1rem;
    }

    @media (max-width: 760px) {
      .picker-grid {
        grid-template-columns: 1fr;
      }

      .sequence-diagram,
      .assignment-diagram {
        display: grid;
      }

      .diagram-arrow {
        transform: rotate(90deg);
        justify-self: center;
      }

      .lane-row {
        grid-template-columns: 1fr;
      }

      .lane-track,
      .timeline-row {
        grid-template-columns: 1fr;
      }

      .lane-track span,
      .timeline-row span {
        grid-column: auto !important;
      }
    }
  `]
})
export class KotlinEditorPageComponent {
  protected readonly programGroups: KotlinProgramGroup[] = KOTLIN_PROGRAM_GROUPS;
  protected readonly programs: KotlinProgram[] = KOTLIN_PROGRAMS;
  protected selectedGroupId = this.programGroups[0].id;
  protected selectedProgramId = this.filteredPrograms[0].id;
  protected showCommonFunctions = false;
  protected builderProgramConfig: BuilderProgramConfig = {
    timing: { ...DEFAULT_BUILDER_PROGRAM_CONFIG.timing },
    company: { ...DEFAULT_BUILDER_PROGRAM_CONFIG.company }
  };

  protected get filteredPrograms(): KotlinProgram[] {
    return this.programs.filter((program) => program.groupId === this.selectedGroupId);
  }

  protected get selectedProgram(): KotlinProgram {
    return this.filteredPrograms.find((program) => program.id === this.selectedProgramId) ?? this.filteredPrograms[0];
  }

  protected get selectedProgramCode(): string {
    return buildKotlinProgramCode(this.selectedProgram.id, this.builderProgramConfig, this.showCommonFunctions);
  }

  protected get selectedProgramRunnableCode(): string {
    return buildKotlinProgramCode(this.selectedProgram.id, this.builderProgramConfig, true);
  }

  protected get selectedIntroduction(): ProgramIntroduction {
    if (this.selectedProgram.id === 'construction-company') {
      return this.constructionCompanyIntroduction;
    }

    return PROGRAM_INTRODUCTIONS[this.selectedProgram.id] ?? {
      step: 'Program introduction',
      title: this.selectedProgram.label,
      paragraphs: [this.selectedProgram.description],
      tasks: [],
      notices: []
    };
  }

  private get constructionCompanyIntroduction(): ProgramIntroduction {
    const houseCount = this.builderProgramConfig.company.houseCount;
    const builderCount = this.builderProgramConfig.company.builderCount;

    return {
      step: 'Step 3: Scale the threaded model',
      title: `Bob assigns ${houseCount} ${this.pluralize('house', houseCount)} to ${builderCount} ${this.pluralize('builder', builderCount)}`,
      paragraphs: [
        `This program keeps the thread idea from Step 2, but scales it from one house to ${houseCount} ${this.pluralize('house', houseCount)}. Bob hires ${builderCount} ${this.pluralize('builder', builderCount)} and splits the houses between them.`,
        `The program starts ${builderCount} builder ${this.pluralize('thread', builderCount)}. Each builder thread receives its assigned houses, then runs the same house-building flow for each one.`,
        'This step shows why raw threads become harder to manage as the work grows. It gives us the reason to move next toward coroutines and structured concurrency.'
      ],
      tasks: [
        { label: 'Houses', duration: String(houseCount) },
        { label: 'Builders', duration: String(builderCount) },
        { label: 'Thread model', duration: `${builderCount} builder ${this.pluralize('thread', builderCount)}` }
      ],
      diagram: {
        type: 'assignment',
        kicker: 'Thread assignment',
        title: 'Split houses across builder threads',
        sourceLabel: `${houseCount} ${this.pluralize('house', houseCount)}`,
        sourceDetail: 'Configurable contract size',
        builders: Array.from({ length: builderCount }, (_, index) => ({
          label: `Builder ${index + 1}`,
          detail: 'Assigned houses'
        }))
      },
      notices: [
        'The same house-building flow runs inside each builder thread.',
        'Changing houses or builders changes the code and the explanation together.',
        'This prepares the move to structured concurrency, where groups of concurrent work are easier to manage.'
      ]
    };
  }

  private pluralize(label: string, count: number): string {
    return count === 1 ? label : `${label}s`;
  }

  protected handleGroupChange(): void {
    this.selectedProgramId = this.filteredPrograms[0].id;
  }
}

interface ProgramIntroduction {
  step: string;
  title: string;
  paragraphs: string[];
  tasks: Array<{
    label: string;
    duration: string;
  }>;
  diagram?: ProgramDiagram;
  notices: string[];
}

type ProgramDiagram = SequenceDiagram | LaneDiagram | AssignmentDiagram;

interface SequenceDiagram {
  type: 'sequence';
  kicker: string;
  title: string;
  nodes: Array<{
    icon: string;
    label: string;
    detail: string;
  }>;
}

interface LaneDiagram {
  type: 'lanes';
  kicker: string;
  title: string;
  lanes: Array<{
    label: string;
    items: Array<{
      label: string;
      detail: string;
      columnStart: number;
      columnSpan: number;
      muted?: boolean;
    }>;
  }>;
  timeline: Array<{
    label: string;
    detail: string;
    columnStart: number;
    columnSpan: number;
    highlight?: boolean;
  }>;
}

interface AssignmentDiagram {
  type: 'assignment';
  kicker: string;
  title: string;
  sourceLabel: string;
  sourceDetail: string;
  builders: Array<{
    label: string;
    detail: string;
  }>;
}

const PROGRAM_INTRODUCTIONS: Record<string, ProgramIntroduction> = {
  'sequential-builder': {
    step: 'Step 1: Sequential baseline',
    title: 'Start with the slow, easy-to-reason-about version',
    paragraphs: [
      'This first program is the baseline for the whole journey from sequential code to concurrency and then coroutines. Bob builds one standard-size house by doing every task one after another.',
      'Nothing overlaps yet. Bob orders windows and waits, orders doors and waits, then lays bricks and installs everything. This makes the control flow simple, but it also makes waiting time expensive.',
      'With the default timing, the work takes 13 weeks: 5 + 5 + 2 + 1/2 + 1/2. When you run it, notice that the output follows one straight line of work.'
    ],
    tasks: [
      { label: 'Order windows', duration: '5 weeks' },
      { label: 'Order doors', duration: '5 weeks' },
      { label: 'Lay bricks', duration: '2 weeks' },
      { label: 'Install windows', duration: '1/2 week' },
      { label: 'Install doors', duration: '1/2 week' }
    ],
    diagram: {
      type: 'sequence',
      kicker: 'Execution shape',
      title: 'One task blocks the next task',
      nodes: [
        { icon: 'pi pi-shopping-cart', label: 'Order windows', detail: 'Wait 5 weeks' },
        { icon: 'pi pi-shopping-cart', label: 'Order doors', detail: 'Wait 5 weeks' },
        { icon: 'pi pi-home', label: 'Lay bricks', detail: 'Work 2 weeks' },
        { icon: 'pi pi-wrench', label: 'Install', detail: 'Finish 1 week' }
      ]
    },
    notices: [
      'The output should read like one straight story.',
      'Waiting work still blocks the whole program.',
      'This baseline gives us something concrete to improve.'
    ]
  },
  'concurrent-builder': {
    step: 'Step 2: Overlap independent work with threads',
    title: 'Keep the same house, but stop wasting waiting time',
    paragraphs: [
      'This program is the first improvement over the sequential baseline. The house and timings are the same, but Bob starts independent tasks in separate threads.',
      'Window ordering, door ordering, and brick work can all be in progress over the same period. After starting those threads, Bob uses join() to wait until they are complete before installing the windows and doors.',
      'When you run it, compare the output with Step 1. The total time drops because the long supplier waits now overlap instead of happening one after another. This prepares the exact mental model we will later express with coroutines.'
    ],
    tasks: [
      { label: 'Order windows', duration: '5 weeks' },
      { label: 'Order doors', duration: '5 weeks' },
      { label: 'Lay bricks', duration: '2 weeks' },
      { label: 'Wait with join()', duration: '3 threads' },
      { label: 'Install window', duration: '1/2 week' },
      { label: 'Install door', duration: '1/2 week' }
    ],
    diagram: {
      type: 'lanes',
      kicker: 'Execution shape',
      title: 'Independent work overlaps in time',
      lanes: [
        {
          label: 'Thread 1',
          items: [
            { label: 'Order windows', detail: '5 weeks', columnStart: 1, columnSpan: 2 }
          ]
        },
        {
          label: 'Thread 2',
          items: [
            { label: 'Order doors', detail: '5 weeks', columnStart: 1, columnSpan: 2 }
          ]
        },
        {
          label: 'Thread 3',
          items: [
            { label: 'Lay bricks', detail: '2 weeks', columnStart: 1, columnSpan: 1 }
          ]
        },
        {
          label: 'Main',
          items: [
            { label: 'join()', detail: 'wait for worker threads', columnStart: 1, columnSpan: 2 },
            { label: 'Install window', detail: '1/2 week', columnStart: 3, columnSpan: 1 },
            { label: 'Install door', detail: '1/2 week', columnStart: 4, columnSpan: 1 }
          ]
        }
      ],
      timeline: [
        { label: 'Weeks 1-2', detail: 'Orders + brick work overlap', columnStart: 2, columnSpan: 1, highlight: true },
        { label: 'Weeks 3-5', detail: 'Waiting for supplier orders', columnStart: 3, columnSpan: 1 },
        { label: 'Week 6', detail: 'Install window, then door', columnStart: 4, columnSpan: 2, highlight: true }
      ]
    },
    notices: [
      'The code starts work first, then waits with join().',
      'The output can interleave because multiple threads are active.',
      'This is the same overlap idea coroutines will express with lighter tools.'
    ]
  }
};
