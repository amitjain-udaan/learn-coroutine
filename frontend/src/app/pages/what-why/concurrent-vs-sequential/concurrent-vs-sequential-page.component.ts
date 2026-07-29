import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { FlipCardComponent } from '../../../shared/flip-card/flip-card.component';
import { KotlinCodeViewerComponent } from '../../../shared/kotlin-code-viewer/kotlin-code-viewer.component';
import { KotlinPlaygroundComponent } from '../../../shared/kotlin-playground/kotlin-playground.component';

@Component({
  selector: 'app-concurrent-vs-sequential-page',
  standalone: true,
  imports: [AccordionModule, CardModule, TagModule, FlipCardComponent, KotlinCodeViewerComponent, KotlinPlaygroundComponent],
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
            <span>Order windows <strong>1 week</strong></span>
            <span>Order doors <strong>1 week</strong></span>
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
                <span>Order windows<br>1 week</span>
              </div>
              <i class="pi pi-arrow-right timeline-arrow" aria-hidden="true"></i>
              <div class="timeline-step wait-step">
                <i class="pi pi-shopping-cart" aria-hidden="true"></i>
                <span>Order doors<br>1 week</span>
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
              If Bob treats every step as blocking, the work takes 5 weeks: 1 + 1 + 2 + 1/2 + 1/2.
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
                <span>Flip to reveal the 3 week construction flow</span>
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
                <div class="lane-label">Week 1</div>
                <div class="lane-step wait-step">Windows ordered</div>
                <div class="lane-step wait-step">Doors ordered</div>
                <div class="lane-step active-step">Lay bricks</div>

                <div class="lane-label">Week 2</div>
                <div class="lane-step done-step">Windows ready</div>
                <div class="lane-step done-step">Doors ready</div>
                <div class="lane-step active-step">Lay bricks</div>

                <div class="lane-label">Week 3</div>
                <div class="lane-step muted-step">Install windows</div>
                <div class="lane-step muted-step">Install doors</div>
                <div class="lane-step done-step">House ready</div>
              </div>

              <p>
                Here Bob still does the physical work himself, but ordering windows and doors can be in progress
                while he lays bricks. The total time becomes about 3 weeks instead of 5.
              </p>
            </div>
          </app-flip-card>
        </div>
      </p-card>

      <div class="lesson-grid">
        <p-card>
          <h3>Sequential programming</h3>
          <p>
            Steps run in a fixed order. Bob orders windows, waits a week, orders doors, waits another week,
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

      <p-card>
        <h3>Common functions used in this section</h3>
        <p>
          These helpers keep the examples focused on the scenario. Expand this when you want to inspect
          the shared thread tracking, timing, logging, and summary code.
        </p>

        <p-accordion value="none">
          <p-accordion-panel value="common-functions">
            <p-accordion-header>Common Kotlin helpers</p-accordion-header>
            <p-accordion-content>
              <app-kotlin-code-viewer [code]="commonFunctionsCode" />
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </p-card>

      <p-card>
        <h3>Sequential code: Bob works alone</h3>
        <p>
          Here <code>1000 ms = 1 week</code>. Bob does every task one after another, so the total time is
          close to 5 seconds, representing 5 weeks of house work.
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
      .scenario-grid {
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
    }
  `]
})
export class ConcurrentVsSequentialPageComponent {
  protected readonly commonFunctionsCode = `data class ThreadTiming(
    val name: String,
    val firstSeenAt: Long,
    var lastSeenAt: Long
) {
    val livedForMillis: Long
        get() = lastSeenAt - firstSeenAt
}

class ThreadNameStore {
    companion object {
        private val threadTimings = mutableMapOf<String, ThreadTiming>()

        @Synchronized
        fun addThreadName() {
            val threadName = Thread.currentThread().name
            val now = System.currentTimeMillis()

            val timing = threadTimings[threadName]
            if (timing == null) {
                threadTimings[threadName] = ThreadTiming(
                    name = threadName,
                    firstSeenAt = now,
                    lastSeenAt = now
                )
            } else {
                timing.lastSeenAt = now
            }
        }

        @Synchronized
        fun getThreadNames(): Set<String> = threadTimings.keys.toSet()

        @Synchronized
        fun getThreadTimings(): List<ThreadTiming> = threadTimings.values
            .map { timing ->
                timing.copy()
            }
            .sortedBy { timing ->
                timing.firstSeenAt
            }
    }
}

fun <T> measureTime(block: () -> T): Pair<T, Long> {
    val startedAt = System.currentTimeMillis()
    val result = block()
    val finishedAt = System.currentTimeMillis()

    return result to finishedAt - startedAt
}

fun log(message: String) {
    ThreadNameStore.addThreadName()
    val time = java.time.LocalTime.now().format(
        java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss.SSS")
    )

    println("${'$'}time | ${'$'}{Thread.currentThread().name} | ${'$'}message")
}

fun printSummary(label: String, elapsedMillis: Long) {
    val threadTimings = ThreadNameStore.getThreadTimings()

    println()
    println("========== ${'$'}label summary ==========")
    println("Total time    : ${'$'}elapsedMillis ms")
    println("Total threads : ${'$'}{threadTimings.size}")
    println("Thread timings:")
    threadTimings.forEach { timing ->
        println("  - ${'$'}{timing.name}: ${'$'}{timing.livedForMillis} ms")
    }
    println("======================================")
}`;

  protected readonly sequentialBuilderCode = `const val WEEK = 1000L
const val HALF_WEEK = WEEK / 2

class Builder {
    fun orderWindows() {
        log("ordering windows")
        Thread.sleep(WEEK)
        log("ordered windows completed")
    }

    fun orderDoors() {
        log("ordering doors")
        Thread.sleep(WEEK)
        log("ordered doors completed")
    }

    fun stackBrick() {
        log("laying brick")
        Thread.sleep(2 * WEEK)
        log("stack brick completed")
    }

    fun installWindow() {
        log("installing window")
        Thread.sleep(HALF_WEEK)
        log("installed window completed")
    }

    fun installDoor() {
        log("installing door")
        Thread.sleep(HALF_WEEK)
        log("installed door completed")
    }
}`;

  protected readonly scenarioCode = `${this.commonFunctionsCode}

${this.sequentialBuilderCode}

fun main() {
    val builder = Builder()

    val (_, sequentialTime) = measureTime {
        builder.orderWindows()
        builder.orderDoors()
        builder.stackBrick()
        builder.installWindow()
        builder.installDoor()
    }

    printSummary("Sequential", sequentialTime)
}`;
}
