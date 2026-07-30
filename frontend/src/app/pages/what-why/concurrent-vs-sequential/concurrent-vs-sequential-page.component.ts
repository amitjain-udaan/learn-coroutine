import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { FlipCardComponent } from '../../../shared/flip-card/flip-card.component';
import { KotlinCommonFunctionsSectionComponent } from '../../../shared/kotlin-common-functions-section/kotlin-common-functions-section.component';
import { KotlinCodeViewerComponent } from '../../../shared/kotlin-code-viewer/kotlin-code-viewer.component';
import { KotlinPlaygroundComponent } from '../../../shared/kotlin-playground/kotlin-playground.component';
import {
  BUILDER_CODE,
  COMMON_FUNCTIONS_CODE,
  CONCURRENT_MAIN_CODE,
  CONCURRENT_PROGRAM_CODE,
  CONSTRUCTION_COMPANY_CODE,
  COMPANY_PROGRAM_CODE,
  SEQUENTIAL_MAIN_CODE,
  SEQUENTIAL_PROGRAM_CODE
} from '../../../shared/kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-concurrent-vs-sequential-page',
  standalone: true,
  imports: [
    AccordionModule,
    CardModule,
    TagModule,
    FlipCardComponent,
    KotlinCodeViewerComponent,
    KotlinCommonFunctionsSectionComponent,
    KotlinPlaygroundComponent
  ],
  template: `
    <section class="lesson-page">
      <header class="lesson-header">
        <p-tag value="01 What/Why?" severity="info" />
        <h2>Concurrent programming vs sequential programming</h2>
        <p>
          Bob starts as a single builder taking one house contract. Later, think of the same work as a
          construction company that can start independent tasks while other tasks are waiting.
        </p>
      </header>

      <p-card>
        <div class="scenario-intro">
          <div>
            <span class="node-label">Scenario</span>
            <h3>Bob has to build one standard-size house</h3>
            <p>
              Bob is the only person available. The house is standard, so every task has a known duration.
              Some tasks require Bob's hands, while some tasks mostly wait for suppliers.
            </p>
          </div>

          <div class="task-list" aria-label="House building task list">
            <span>Order windows <strong>5 weeks</strong></span>
            <span>Order doors <strong>5 weeks</strong></span>
            <span>Lay bricks <strong>2 weeks</strong></span>
            <span>Install windows <strong>1/2 week</strong></span>
            <span>Install doors <strong>1/2 week</strong></span>
          </div>
        </div>
      </p-card>

      <p-card>
        <div class="scenario-grid" aria-label="Bob house building scenario comparing sequential and concurrent work">
          <div class="scenario-panel sequential-panel">
            <div class="panel-header">
              <span class="node-label">Sequential</span>
              <strong>Bob finishes each task before starting the next</strong>
            </div>

            <div class="timeline">
              <div class="timeline-step active-step">
                <i class="pi pi-shopping-cart" aria-hidden="true"></i>
                <span>Order windows<br>5 weeks</span>
              </div>
              <i class="pi pi-arrow-right timeline-arrow" aria-hidden="true"></i>
              <div class="timeline-step wait-step">
                <i class="pi pi-shopping-cart" aria-hidden="true"></i>
                <span>Order doors<br>5 weeks</span>
              </div>
              <i class="pi pi-arrow-right timeline-arrow" aria-hidden="true"></i>
              <div class="timeline-step done-step">
                <i class="pi pi-home" aria-hidden="true"></i>
                <span>Lay bricks<br>2 weeks</span>
              </div>
              <i class="pi pi-arrow-right timeline-arrow" aria-hidden="true"></i>
              <div class="timeline-step muted-step">
                <i class="pi pi-wrench" aria-hidden="true"></i>
                <span>Install both<br>1 week</span>
              </div>
            </div>

            <p>
              If Bob treats every step as blocking, the work takes 13 weeks: 5 + 5 + 2 + 1/2 + 1/2.
              The problem is that Bob waits during supplier orders instead of using that time for brick work.
            </p>
          </div>

          <app-flip-card
            openLabel="Reveal Bob's concurrent house-building plan"
            closeLabel="Hide Bob's concurrent house-building plan">
            <div flip-card-front class="scenario-panel concurrent-panel flip-front-panel">
              <div class="panel-header">
                <span class="node-label">Concurrent</span>
                <strong>Bob starts supplier work, then uses waiting time</strong>
              </div>

              <div class="closed-state">
                <i class="pi pi-sync" aria-hidden="true"></i>
                <span>Flip to reveal the 6 week construction flow</span>
              </div>

              <p>
                The important question: can Bob do useful work while windows and doors are being prepared?
              </p>
            </div>

            <div flip-card-back class="scenario-panel concurrent-panel">
              <div class="panel-header">
                <span class="node-label">Concurrent</span>
                <strong>Bob starts supplier work, then uses waiting time</strong>
              </div>

              <div class="lane-grid">
                <div class="lane-label">Weeks 1-2</div>
                <div class="lane-step wait-step">Windows ordered</div>
                <div class="lane-step wait-step">Doors ordered</div>
                <div class="lane-step active-step">Lay bricks</div>

                <div class="lane-label">Weeks 3-5</div>
                <div class="lane-step wait-step">Waiting for windows</div>
                <div class="lane-step wait-step">Waiting for doors</div>
                <div class="lane-step done-step">Brick work done</div>

                <div class="lane-label">Week 6</div>
                <div class="lane-step muted-step">Install windows</div>
                <div class="lane-step muted-step">Install doors</div>
                <div class="lane-step done-step">House ready</div>
              </div>

              <p>
                Here Bob still does the physical work himself, but ordering windows and doors can be in progress
              while he lays bricks. The total time becomes about 6 weeks instead of 13.
              </p>
            </div>
          </app-flip-card>
        </div>
      </p-card>

      <div class="lesson-grid">
        <p-card>
          <h3>Sequential programming</h3>
          <p>
            Steps run in a fixed order. Bob orders windows, waits 5 weeks, orders doors, waits another 5 weeks,
            then lays bricks and installs everything.
          </p>
        </p-card>

        <p-card>
          <h3>Concurrent programming</h3>
          <p>
            Multiple tasks are in progress over the same period. Bob places supplier orders first, then lays
            bricks while those orders are pending.
          </p>
        </p-card>

        <p-card>
          <h3>Concurrency is not always parallelism</h3>
          <p>
            Concurrency is about structure: overlapping tasks. Parallelism is about execution: tasks
            literally running at the same instant on different CPU cores.
          </p>
        </p-card>
      </div>

      <app-kotlin-common-functions-section [code]="commonFunctionsCode" />

      <p-card>
        <h3>Sequential code: Bob works alone</h3>
        <p>
          Here <code>1000 ms = 1 week</code>. Bob does every task one after another, so the total time is
          close to 13 seconds, representing 13 weeks of house work.
        </p>

        <p-accordion value="run-sequential-scenario">
          <p-accordion-panel value="sequential-builder-code">
            <p-accordion-header>Sequential Builder code</p-accordion-header>
            <p-accordion-content>
              <app-kotlin-code-viewer [code]="sequentialBuilderCode" />
            </p-accordion-content>
          </p-accordion-panel>

          <p-accordion-panel value="run-sequential-scenario">
            <p-accordion-header>Run the sequential scenario</p-accordion-header>
            <p-accordion-content>
              <p>
                Run the example and read the logs. Each line shows time, thread name, and message, so the
                waiting between each sequential task is easy to see.
              </p>

              <app-kotlin-playground [startingCode]="scenarioCode" />
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </p-card>

      <p-card>
        <h3>Concurrent code: Bob coordinates independent work</h3>
        <p>
          Bob starts window ordering, door ordering, and brick work at the same time. He waits for those
          threads to finish with <code>join()</code>, then installs the windows and doors.
        </p>

        <p-accordion value="run-concurrent-scenario">
          <p-accordion-panel value="concurrent-builder-code">
            <p-accordion-header>Concurrent Builder code</p-accordion-header>
            <p-accordion-content>
              <app-kotlin-code-viewer [code]="concurrentBuilderCode" />
            </p-accordion-content>
          </p-accordion-panel>

          <p-accordion-panel value="run-concurrent-scenario">
            <p-accordion-header>Run the concurrent scenario</p-accordion-header>
            <p-accordion-content>
              <p>
                Run the example and compare the summary with the sequential run. The total time drops
                because the long supplier orders overlap with brick work.
              </p>

              <app-kotlin-playground [startingCode]="concurrentScenarioCode" />
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </p-card>

      <p-card>
        <h3>Next scenario: Bob opens a construction company</h3>
        <p>
          Bob now gets a contract for 10 similar standard-size houses. Instead of doing everything alone,
          he hires 2 builders and splits the houses between them.
        </p>

        <div class="company-plan" aria-label="Bob construction company assigns 10 houses to 2 builders">
          <div class="company-summary">
            <div>
              <span class="node-label">Contract</span>
              <strong>10 similar houses</strong>
            </div>

            <i class="pi pi-arrow-right" aria-hidden="true"></i>

            <div>
              <span class="node-label">Team</span>
              <strong>2 hired builders</strong>
            </div>
          </div>

          <div class="builder-lanes">
            <div class="builder-lane">
              <strong>Builder 1</strong>
              <div class="house-list" aria-label="Builder 1 assigned houses">
                <span>House 1</span>
                <span>House 2</span>
                <span>House 3</span>
                <span>House 4</span>
                <span>House 5</span>
              </div>
            </div>

            <div class="builder-lane">
              <strong>Builder 2</strong>
              <div class="house-list" aria-label="Builder 2 assigned houses">
                <span>House 6</span>
                <span>House 7</span>
                <span>House 8</span>
                <span>House 9</span>
                <span>House 10</span>
              </div>
            </div>
          </div>
        </div>

        <p>
          This is the next level of the same idea: each house still has sequential steps inside it, but
          multiple builders let Bob run more than one house workflow at the same time.
        </p>

        <p-accordion value="run-company-scenario">
          <p-accordion-panel value="construction-company-code">
            <p-accordion-header>Construction Company code</p-accordion-header>
            <p-accordion-content>
              <app-kotlin-code-viewer [code]="constructionCompanyCode" />
            </p-accordion-content>
          </p-accordion-panel>

          <p-accordion-panel value="run-company-scenario">
            <p-accordion-header>Run the company scenario</p-accordion-header>
            <p-accordion-content>
              <p>
                Run the example and watch two builder threads work at the same time. The company creates
                one thread for each hired builder, and each builder handles five houses.
              </p>

              <app-kotlin-playground [startingCode]="companyScenarioCode" />
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </p-card>
    </section>
  `,
  styles: [`
    .lesson-page {
      display: grid;
      gap: 1rem;
    }

    .lesson-header {
      display: grid;
      gap: .5rem;
      max-width: 52rem;
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

    .scenario-grid,
    .lesson-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
      align-items: stretch;
    }

    .scenario-intro {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(16rem, .8fr);
      gap: 1rem;
      align-items: start;
    }

    .scenario-intro h3 {
      margin: .35rem 0 .75rem;
    }

    .task-list {
      display: grid;
      gap: .5rem;
    }

    .task-list span {
      min-height: 2.75rem;
      padding: .65rem .75rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #f9fafb;
      color: #374151;
      font-size: .875rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
    }

    .task-list strong {
      color: #111827;
      white-space: nowrap;
    }

    .lesson-grid {
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
    }

    .scenario-panel {
      min-width: 0;
      min-height: 100%;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
      display: grid;
      gap: 1rem;
      align-content: start;
    }

    .sequential-panel {
      border-top: .25rem solid #dc2626;
    }

    .concurrent-panel {
      border-top: .25rem solid #059669;
    }

    .flip-front-panel {
      justify-content: stretch;
    }

    .closed-state {
      min-height: 10rem;
      padding: 1rem;
      border: 1px dashed #86efac;
      border-radius: .5rem;
      background: #f0fdf4;
      color: #047857;
      display: grid;
      place-items: center;
      gap: .75rem;
      text-align: center;
      font-weight: 800;
    }

    .closed-state i {
      font-size: 2rem;
    }

    .panel-header {
      display: grid;
      gap: .35rem;
    }

    .node-label {
      color: #6b7280;
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .timeline {
      display: grid;
      grid-template-columns: minmax(5.5rem, 1fr) auto minmax(5.5rem, 1fr) auto minmax(5.5rem, 1fr) auto minmax(5.5rem, 1fr);
      gap: .5rem;
      align-items: center;
    }

    .timeline-step,
    .lane-step {
      min-height: 4rem;
      padding: .6rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      color: #374151;
      font-size: .8125rem;
      font-weight: 700;
      text-align: center;
      display: grid;
      place-items: center;
      gap: .35rem;
    }

    .timeline-arrow {
      color: #6b7280;
      justify-self: center;
    }

    .active-step {
      border-color: #bfdbfe;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .wait-step {
      border-color: #fed7aa;
      background: #fff7ed;
      color: #c2410c;
    }

    .done-step {
      border-color: #bbf7d0;
      background: #ecfdf5;
      color: #047857;
    }

    .muted-step {
      background: #f9fafb;
      color: #6b7280;
    }

    .lane-grid {
      display: grid;
      grid-template-columns: 5rem repeat(3, minmax(0, 1fr));
      gap: .5rem;
      align-items: stretch;
    }

    .lane-label {
      min-height: 3rem;
      padding: .5rem;
      border-radius: .5rem;
      background: #111827;
      color: #ffffff;
      font-size: .8125rem;
      font-weight: 800;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .company-plan {
      display: grid;
      gap: 1rem;
      margin: 1rem 0;
    }

    .company-summary {
      display: grid;
      grid-template-columns: minmax(12rem, 1fr) auto minmax(12rem, 1fr);
      gap: .75rem;
      align-items: center;
    }

    .company-summary div,
    .builder-lane {
      min-width: 0;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
      display: grid;
      gap: .4rem;
    }

    .company-summary div {
      border-top: .25rem solid #2563eb;
    }

    .company-summary i {
      color: #6b7280;
      justify-self: center;
    }

    .builder-lanes {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .builder-lane {
      border-top: .25rem solid #0f766e;
    }

    .house-list {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: .5rem;
    }

    .house-list span {
      min-height: 3rem;
      padding: .5rem;
      border: 1px solid #ccfbf1;
      border-radius: .5rem;
      background: #f0fdfa;
      color: #0f766e;
      font-size: .8125rem;
      font-weight: 800;
      display: grid;
      place-items: center;
      text-align: center;
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

    :host ::ng-deep .p-accordion {
      margin-top: 1rem;
    }

    @media (max-width: 900px) {
      .scenario-intro,
      .scenario-grid,
      .company-summary,
      .builder-lanes {
        grid-template-columns: 1fr;
      }

      .timeline {
        grid-template-columns: 1fr;
      }

      .timeline-arrow {
        transform: rotate(90deg);
      }

      .lane-grid {
        grid-template-columns: 4.5rem repeat(3, minmax(4.5rem, 1fr));
        overflow-x: auto;
      }

      .company-summary i {
        transform: rotate(90deg);
      }

      .house-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `]
})
export class ConcurrentVsSequentialPageComponent {
  protected readonly commonFunctionsCode = COMMON_FUNCTIONS_CODE;
  protected readonly sequentialBuilderCode = BUILDER_CODE;
  protected readonly scenarioCode = SEQUENTIAL_PROGRAM_CODE;
  protected readonly concurrentBuilderCode = CONCURRENT_MAIN_CODE;
  protected readonly concurrentScenarioCode = CONCURRENT_PROGRAM_CODE;
  protected readonly constructionCompanyCode = CONSTRUCTION_COMPANY_CODE;
  protected readonly companyScenarioCode = COMPANY_PROGRAM_CODE;
}
