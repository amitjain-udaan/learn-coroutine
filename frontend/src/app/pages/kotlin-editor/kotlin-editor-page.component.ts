import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { BasicsProgramGroupComponent } from '../../shared/kotlin-program-groups/basics-program-group.component';
import { SequentialVsConcurrentCoroutineProgramGroupComponent } from '../../shared/kotlin-program-groups/sequential-vs-concurrent-coroutine-program-group.component';
import { SequentialVsConcurrentProgramGroupComponent } from '../../shared/kotlin-program-groups/sequential-vs-concurrent-program-group.component';
import { KotlinCommonFunctionsSectionComponent } from '../../shared/kotlin-common-functions-section/kotlin-common-functions-section.component';
import { KotlinLocalRunnerComponent } from '../../shared/kotlin-local-runner/kotlin-local-runner.component';
import {
  BuilderProgramConfig,
  DEFAULT_BUILDER_PROGRAM_CONFIG,
  KOTLIN_PROGRAM_GROUPS,
  KOTLIN_PROGRAMS,
  KotlinProgram,
  KotlinProgramGroup,
  buildKotlinProgramCode,
  buildKotlinProgramSupportCode
} from '../../shared/kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-kotlin-editor-page',
  standalone: true,
  imports: [
    AccordionModule,
    BasicsProgramGroupComponent,
    FormsModule,
    KotlinCommonFunctionsSectionComponent,
    KotlinLocalRunnerComponent,
    SelectModule,
    SequentialVsConcurrentCoroutineProgramGroupComponent,
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
                    @case ('company') {
                      <div class="company-diagram">
                        <div class="company-title">
                          <span>Time graph</span>
                          <strong>Hover a line to highlight its parent thread chain</strong>
                        </div>

                        <div
                          class="thread-chart"
                          [style.--company-columns]="diagram.columnTemplate"
                          [style.--company-week-count]="diagram.weeks.length"
                        >
                          <div class="company-chart-header">
                            <span>Thread</span>
                            <div class="company-week-scale" aria-label="Weeks">
                              @for (week of diagram.weeks; track week) {
                                <span [class.major]="week === 1 || week % 6 === 0">{{ week }}</span>
                              }
                            </div>
                          </div>

                          @for (row of diagram.rows; track row.id) {
                            <div
                              class="company-chart-row"
                              [class.level-main]="row.level === 'main'"
                              [class.level-builder]="row.level === 'builder'"
                              [class.level-house]="row.level === 'house'"
                              [class.level-child]="row.level === 'child'"
                              [class.related]="isCompanyRowHighlighted(row)"
                              [class.dimmed]="hasCompanyHighlight() && !isCompanyRowHighlighted(row)"
                            >
                              <strong>{{ row.label }}</strong>
                              <div class="company-line-track">
                                @for (line of row.lines; track line.id) {
                                  <span
                                    class="company-life-line"
                                    [class.main-line]="line.kind === 'main'"
                                    [class.builder-line]="line.kind === 'builder'"
                                    [class.house-line]="line.kind === 'house'"
                                    [class.child-line]="line.kind === 'child'"
                                    [class.local-line]="line.kind === 'local'"
                                    [class.related]="isCompanyLineHighlighted(line)"
                                    [class.dimmed]="hasCompanyHighlight() && !isCompanyLineHighlighted(line)"
                                    [style.grid-column]="line.start + ' / span ' + line.span"
                                    [attr.data-title]="line.label"
                                    [attr.data-detail]="line.detail"
                                    (mouseenter)="highlightCompanyLine(line)"
                                    (mouseleave)="clearCompanyHighlight()"
                                  ></span>
                                }
                              </div>
                            </div>
                          }
                        </div>

                        <div class="company-legend" aria-label="Thread legend">
                          @for (item of diagram.legend; track item.label) {
                            <span
                              [class.main-line]="item.kind === 'main'"
                              [class.builder-line]="item.kind === 'builder'"
                              [class.house-line]="item.kind === 'house'"
                              [class.child-line]="item.kind === 'child'"
                              [class.local-line]="item.kind === 'local'"
                            >
                              {{ item.label }}
                            </span>
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
                @case ('sequential-vs-concurrent-coroutine') {
                  <app-sequential-vs-concurrent-coroutine-program-group
                    [selectedProgram]="selectedProgram"
                    [programConfig]="builderProgramConfig"
                    (programConfigChange)="builderProgramConfig = $event"
                  />
                }
              }

              @if (selectedProgramSupportCode) {
                <app-kotlin-common-functions-section
                  [code]="selectedProgramSupportCode"
                  [title]="selectedSupportSectionTitle"
                  [description]="selectedSupportSectionDescription"
                />
              }

              <app-kotlin-local-runner
                [code]="selectedProgramCode"
                [runnableCode]="selectedProgramRunnableCode"
                [showCommonFunctionsToggle]="!!selectedProgramSupportCode"
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

    .company-diagram {
      display: grid;
      gap: .85rem;
      padding: 1rem;
    }

    .company-title {
      display: grid;
      gap: .2rem;
    }

    .company-title span {
      color: #2563eb;
      font-size: .75rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .company-title strong {
      color: #111827;
      font-size: 1rem;
    }

    .thread-chart {
      display: grid;
      gap: .22rem;
      padding: .75rem;
      border: 1px solid #dbeafe;
      border-radius: .65rem;
      background: #ffffff;
    }

    .company-chart-header,
    .company-chart-row {
      display: grid;
      grid-template-columns: 10rem minmax(0, 1fr);
      gap: .6rem;
      align-items: center;
    }

    .company-chart-header > span,
    .company-chart-row > strong {
      min-width: 0;
      border-radius: .4rem;
      display: grid;
      align-items: center;
      font-size: .72rem;
      font-weight: 800;
    }

    .company-chart-header > span {
      padding: .25rem .5rem;
      background: #eef2ff;
      color: #1d4ed8;
      text-transform: uppercase;
    }

    .company-chart-row > strong {
      min-height: 1.45rem;
      padding: .18rem .5rem;
      background: #f8fafc;
      color: #334155;
    }

    .company-chart-row.level-house > strong {
      padding-left: .75rem;
    }

    .company-chart-row.level-child > strong {
      padding-left: 1.1rem;
      color: #64748b;
      font-size: .66rem;
    }

    .company-chart-row.related > strong {
      background: #dbeafe;
      color: #1d4ed8;
      box-shadow: inset .22rem 0 0 #2563eb;
    }

    .company-chart-row.dimmed > strong {
      opacity: .38;
    }

    .company-week-scale,
    .company-line-track {
      min-width: 0;
      display: grid;
      grid-template-columns: var(--company-columns);
      gap: .08rem;
      align-items: center;
    }

    .company-week-scale span {
      min-width: 0;
      color: #94a3b8;
      font-size: .55rem;
      font-weight: 800;
      text-align: center;
    }

    .company-week-scale span.major {
      color: #1d4ed8;
    }

    .company-line-track {
      min-height: 1.45rem;
      position: relative;
      border-radius: .25rem;
      background-image: linear-gradient(to right, rgb(226 232 240 / 80%) 1px, transparent 1px);
      background-size: calc(100% / var(--company-week-count)) 100%;
    }

    .company-life-line {
      height: .62rem;
      border-radius: 999px;
      position: relative;
      cursor: default;
      transition: opacity .15s ease, box-shadow .15s ease, transform .15s ease;
    }

    .company-life-line.main-line,
    .company-legend .main-line::before {
      background: #2563eb;
    }

    .company-life-line.builder-line,
    .company-legend .builder-line::before {
      background: #0f766e;
    }

    .company-life-line.house-line,
    .company-legend .house-line::before {
      background: #64748b;
    }

    .company-life-line.child-line,
    .company-legend .child-line::before {
      background: #0284c7;
    }

    .company-life-line.local-line,
    .company-legend .local-line::before {
      background: #f59e0b;
    }

    .company-life-line.related {
      z-index: 3;
      box-shadow: 0 0 0 2px #111827, 0 .45rem 1rem rgb(15 23 42 / 20%);
      transform: scaleY(1.45);
    }

    .company-life-line.dimmed {
      opacity: .14;
    }

    .company-life-line:hover::after {
      content: attr(data-title) ' - ' attr(data-detail);
      position: absolute;
      left: 0;
      bottom: calc(100% + .45rem);
      z-index: 10;
      width: max-content;
      max-width: 20rem;
      padding: .4rem .55rem;
      border-radius: .4rem;
      background: #111827;
      color: #ffffff;
      font-size: .72rem;
      font-weight: 800;
      line-height: 1.35;
      box-shadow: 0 .75rem 1.5rem rgb(15 23 42 / 22%);
      pointer-events: none;
      white-space: normal;
    }

    .company-legend {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      color: #475569;
      font-size: .72rem;
      font-weight: 800;
    }

    .company-legend span {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
    }

    .company-legend span::before {
      content: '';
      width: 1.6rem;
      height: .35rem;
      border-radius: 999px;
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

      .company-chart-header,
      .company-chart-row {
        grid-template-columns: 7.5rem minmax(0, 1fr);
        gap: .4rem;
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
  protected activeCompanyLineIds = new Set<string>();
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

  protected get selectedProgramSupportCode(): string {
    return buildKotlinProgramSupportCode(this.selectedProgram.id, this.builderProgramConfig);
  }

  protected get selectedSupportSectionTitle(): string {
    return this.selectedGroupId === 'sequential-vs-concurrent-coroutine'
      ? 'Coroutine support code used by this program'
      : 'Thread support code used by this program';
  }

  protected get selectedSupportSectionDescription(): string {
    return this.selectedGroupId === 'sequential-vs-concurrent-coroutine'
      ? 'These helpers keep the coroutine examples focused on the scenario. Expand this when you want to inspect coroutine timing, logging, and summary code.'
      : 'These helpers keep the thread examples focused on the scenario. Expand this when you want to inspect thread tracking, timing, logging, and summary code.';
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
    const maxHouseSlots = Math.max(
      ...Array.from({ length: builderCount }, (_, index) => this.getAssignedHouses(index + 1, houseCount, builderCount).length),
      1
    );
    const weeks = Array.from({ length: maxHouseSlots * 6 }, (_, index) => index + 1);

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
        type: 'company',
        kicker: 'Thread assignment',
        title: 'Thread lifetimes across the company run',
        columnTemplate: `repeat(${weeks.length}, minmax(0, 1fr))`,
        weeks,
        rows: this.buildCompanyRows(houseCount, builderCount),
        legend: [
          { label: 'Main thread', kind: 'main' },
          { label: 'Builder thread', kind: 'builder' },
          { label: 'buildHouse call', kind: 'house' },
          { label: 'Child thread', kind: 'child' },
          { label: 'Local builder work', kind: 'local' }
        ]
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

  protected hasCompanyHighlight(): boolean {
    return this.activeCompanyLineIds.size > 0;
  }

  protected isCompanyLineHighlighted(line: CompanyLine): boolean {
    return this.activeCompanyLineIds.has(line.id);
  }

  protected isCompanyRowHighlighted(row: CompanyRow): boolean {
    return row.lines.some((line) => this.isCompanyLineHighlighted(line));
  }

  protected highlightCompanyLine(line: CompanyLine): void {
    this.activeCompanyLineIds = new Set([line.id, ...line.parentIds]);
  }

  protected clearCompanyHighlight(): void {
    this.activeCompanyLineIds = new Set<string>();
  }

  private buildCompanyRows(houseCount: number, builderCount: number): CompanyRow[] {
    const houseWeeks = 6;
    const maxHouseSlots = Math.max(
      ...Array.from({ length: builderCount }, (_, index) => this.getAssignedHouses(index + 1, houseCount, builderCount).length),
      1
    );
    const totalWeeks = maxHouseSlots * houseWeeks;
    const rows: CompanyRow[] = [
      {
        id: 'main-row',
        label: 'Main',
        level: 'main',
        lines: [
          {
            id: 'main',
            label: 'main thread',
            detail: `starts ${builderCount} builder ${this.pluralize('thread', builderCount)}, then waits with join()`,
            kind: 'main',
            start: 1,
            span: totalWeeks,
            parentIds: []
          }
        ]
      }
    ];

    Array.from({ length: builderCount }, (_, index) => {
      const builderNumber = index + 1;
      const builderId = `builder-${builderNumber}`;
      const assignedHouses = this.getAssignedHouses(builderNumber, houseCount, builderCount);
      const builderSpan = Math.max(assignedHouses.length, 1) * houseWeeks;

      rows.push({
        id: `${builderId}-row`,
        label: `Builder ${builderNumber}`,
        level: 'builder',
        lines: [
          {
            id: builderId,
            label: `Builder ${builderNumber} thread`,
            detail: `${assignedHouses.length} assigned ${this.pluralize('house', assignedHouses.length)}`,
            kind: 'builder',
            start: 1,
            span: builderSpan,
            parentIds: ['main']
          }
        ]
      });

      assignedHouses.forEach((houseNumber, houseIndex) => {
        const houseStart = houseIndex * houseWeeks + 1;
        const houseId = `house-${houseNumber}`;
        const parentIds = [builderId, 'main'];

        rows.push({
          id: `${houseId}-row`,
          label: `H${houseNumber}`,
          level: 'house',
          lines: [
            {
              id: houseId,
              label: `buildHouse(H${houseNumber})`,
              detail: `runs inside Builder ${builderNumber}; owns all child work for H${houseNumber}`,
              kind: 'house',
              start: houseStart,
              span: houseWeeks,
              parentIds
            }
          ]
        });

        rows.push(
          this.companyChildRow(houseNumber, 'OW', 'order window thread', 'supplier windows run for 5 weeks', houseStart, 5, [
            houseId,
            ...parentIds
          ]),
          this.companyChildRow(houseNumber, 'OD', 'order door thread', 'supplier doors run for 5 weeks', houseStart, 5, [
            houseId,
            ...parentIds
          ]),
          this.companyChildRow(houseNumber, 'LB', 'lay bricks thread', 'brick work runs for 2 weeks', houseStart, 2, [
            houseId,
            ...parentIds
          ]),
          this.companyChildRow(houseNumber, 'IW', 'install window', 'local builder work after joins', houseStart + 5, 1, [
            houseId,
            ...parentIds
          ], 'local'),
          this.companyChildRow(houseNumber, 'ID', 'install door', 'local builder work after window install', houseStart + 5, 1, [
            houseId,
            ...parentIds
          ], 'local')
        );
      });
    });

    return rows;
  }

  private companyChildRow(
    houseNumber: number,
    shortName: string,
    label: string,
    detail: string,
    start: number,
    span: number,
    parentIds: string[],
    kind: CompanyLineKind = 'child'
  ): CompanyRow {
    const id = `house-${houseNumber}-${shortName.toLowerCase()}`;

    return {
      id: `${id}-row`,
      label: `H${houseNumber} ${shortName}`,
      level: 'child',
      lines: [
        {
          id,
          label: `H${houseNumber} ${label}`,
          detail,
          kind,
          start,
          span,
          parentIds
        }
      ]
    };
  }

  private getAssignedHouses(builderNumber: number, houseCount: number, builderCount: number): number[] {
    return Array.from({ length: houseCount }, (_, index) => index + 1)
      .filter((houseNumber) => (houseNumber - 1) % builderCount === builderNumber - 1);
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

type ProgramDiagram = SequenceDiagram | LaneDiagram | AssignmentDiagram | CompanyDiagram;

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

interface CompanyDiagram {
  type: 'company';
  kicker: string;
  title: string;
  columnTemplate: string;
  weeks: number[];
  rows: CompanyRow[];
  legend: Array<{
    label: string;
    kind: CompanyLineKind;
  }>;
}

interface CompanyRow {
  id: string;
  label: string;
  level: 'main' | 'builder' | 'house' | 'child';
  lines: CompanyLine[];
}

type CompanyLineKind = 'main' | 'builder' | 'house' | 'child' | 'local';

interface CompanyLine {
  id: string;
  label: string;
  detail: string;
  kind: CompanyLineKind;
  start: number;
  span: number;
  parentIds: string[];
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
  },
  'sequential-coroutine-builder': {
    step: 'Step 4: Sequential work with suspend functions',
    title: 'Replace blocking waits with suspendable waits',
    paragraphs: [
      'This program keeps the Step 1 execution shape: Bob still does one task after another. Supplier waiting uses delay(), while local physical work still uses Thread.sleep() so it stays active and occupies the thread.',
      'Sequential suspend code still runs in order, so the total time stays close to the original baseline. The benefit appears only for the supplier waits, where the coroutine can suspend instead of blocking the thread.',
      'When you run it, the output should still read like one straight story. This is the quiet bridge between ordinary sequential code and concurrent coroutine code.'
    ],
    tasks: [
      { label: 'Order windows', duration: 'delay 5 weeks' },
      { label: 'Order doors', duration: 'delay 5 weeks' },
      { label: 'Lay bricks', duration: 'sleep 2 weeks' },
      { label: 'Install window', duration: 'sleep 1/2 week' },
      { label: 'Install door', duration: 'sleep 1/2 week' }
    ],
    diagram: {
      type: 'sequence',
      kicker: 'Coroutine shape',
      title: 'Suspending does not automatically make work concurrent',
      nodes: [
        { icon: 'pi pi-pause-circle', label: 'delay windows', detail: 'Suspend 5 weeks' },
        { icon: 'pi pi-pause-circle', label: 'delay doors', detail: 'Suspend 5 weeks' },
        { icon: 'pi pi-home', label: 'lay bricks', detail: 'Block 2 weeks' },
        { icon: 'pi pi-wrench', label: 'install', detail: 'Block 1 week' }
      ]
    },
    notices: [
      'Suspend functions can still be composed sequentially.',
      'delay() suspends supplier waits; Thread.sleep() keeps local work active.',
      'The control flow is still easy to read because there are no child coroutines yet.'
    ]
  },
  'concurrent-coroutine-builder': {
    step: 'Step 5: Structured concurrency',
    title: 'Start child coroutines for the independent work',
    paragraphs: [
      'This program keeps the same house and timings, but launches independent work as child coroutines inside coroutineScope. Window ordering, door ordering, and brick work begin together.',
      'The parent coroutine waits with joinAll(), then installs the window and door after the independent jobs complete. Because coroutineScope owns the child jobs, the concurrent work has a clear lifetime.',
      'Compare this output with the thread version. The overlap is familiar, but the structure is lighter and the relationship between parent and child work is explicit in the code.'
    ],
    tasks: [
      { label: 'Parent scope', duration: 'coroutineScope' },
      { label: 'Child jobs', duration: '3 launch calls' },
      { label: 'Wait point', duration: 'joinAll()' },
      { label: 'Install work', duration: 'after children' }
    ],
    diagram: {
      type: 'lanes',
      kicker: 'Coroutine shape',
      title: 'Child coroutines overlap inside one parent scope',
      lanes: [
        {
          label: 'Child job 1',
          items: [
            { label: 'Order windows', detail: 'delay 5 weeks', columnStart: 1, columnSpan: 2 }
          ]
        },
        {
          label: 'Child job 2',
          items: [
            { label: 'Order doors', detail: 'delay 5 weeks', columnStart: 1, columnSpan: 2 }
          ]
        },
        {
          label: 'Child job 3',
          items: [
            { label: 'Lay bricks', detail: 'sleep 2 weeks', columnStart: 1, columnSpan: 1 }
          ]
        },
        {
          label: 'Parent',
          items: [
            { label: 'joinAll()', detail: 'wait for children', columnStart: 1, columnSpan: 2 },
            { label: 'Install window', detail: 'sleep 1/2 week', columnStart: 3, columnSpan: 1 },
            { label: 'Install door', detail: 'sleep 1/2 week', columnStart: 4, columnSpan: 1 }
          ]
        }
      ],
      timeline: [
        { label: 'Scope starts', detail: 'launch child coroutines', columnStart: 2, columnSpan: 1, highlight: true },
        { label: 'Scope waits', detail: 'joinAll keeps parent suspended', columnStart: 3, columnSpan: 1 },
        { label: 'Scope finishes', detail: 'install after children complete', columnStart: 4, columnSpan: 2, highlight: true }
      ]
    },
    notices: [
      'Concurrency starts when the program launches child coroutines.',
      'coroutineScope keeps the child jobs attached to the parent operation.',
      'Only delay() suspends coroutine work; Thread.sleep() keeps the coroutine active and blocks the thread.'
    ]
  }
};
