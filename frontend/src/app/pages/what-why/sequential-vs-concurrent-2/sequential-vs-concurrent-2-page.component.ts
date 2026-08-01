import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-sequential-vs-concurrent-2-page',
  standalone: true,
  imports: [CardModule, TagModule],
  template: `
    <section class="lesson-page">
      <header class="lesson-header">
        <p-tag value="01 What/Why?" severity="info" />
        <h2>Sequential VS Concurrent -2</h2>
        <p>
          Bob now runs a construction company. He has 10 houses, 2 builder threads, and each house
          creates child threads for the independent parts of the house work.
        </p>
      </header>

      <p-card>
        <div class="story-grid">
          <div>
            <span class="node-label">Thread tree</span>
            <h3>Main creates builders, builders create house work</h3>
            <p>
              Read this chart from left to right as time. Read it vertically as ownership. Hover any
              line to see the exact work and its parent chain.
            </p>
          </div>

          <div class="summary-strip" aria-label="Construction company summary">
            <span><strong>10</strong> houses</span>
            <span><strong>2</strong> builder threads</span>
            <span><strong>5</strong> houses each</span>
          </div>
        </div>
      </p-card>

      <p-card styleClass="chart-card">
        <div class="chart-title">
          <span class="node-label">Time graph</span>
          <strong>Which thread lives during which weeks</strong>
        </div>

        <div class="thread-chart" [class.has-highlight]="hasHighlight()">
          <div class="chart-header">
            <span>Thread</span>
            <div class="week-scale" aria-label="Weeks">
              @for (week of weeks; track week) {
                <span [class.major]="week === 1 || week % 6 === 0">{{ week }}</span>
              }
            </div>
          </div>

          @for (row of rows; track row.id) {
            <div
              class="chart-row"
              [class.level-main]="row.level === 'main'"
              [class.level-builder]="row.level === 'builder'"
              [class.level-house]="row.level === 'house'"
              [class.level-child]="row.level === 'child'"
              [class.related]="isRowHighlighted(row)"
              [class.dimmed]="hasHighlight() && !isRowHighlighted(row)"
            >
              <strong>{{ row.label }}</strong>
              <div class="line-track">
                @for (line of row.lines; track line.id) {
                  <span
                    class="life-line"
                    [class.main-line]="line.kind === 'main'"
                    [class.builder-line]="line.kind === 'builder'"
                    [class.house-line]="line.kind === 'house'"
                    [class.child-line]="line.kind === 'child'"
                    [class.local-line]="line.kind === 'local'"
                    [class.related]="isLineHighlighted(line)"
                    [class.dimmed]="hasHighlight() && !isLineHighlighted(line)"
                    [style.grid-column]="line.start + ' / span ' + line.span"
                    [attr.data-title]="line.label"
                    [attr.data-detail]="line.detail"
                    (mouseenter)="highlightLine(line)"
                    (mouseleave)="clearHighlight()"
                  ></span>
                }
              </div>
            </div>
          }
        </div>

        <div class="legend" aria-label="Line legend">
          <span class="main-line">Main thread</span>
          <span class="builder-line">Builder thread</span>
          <span class="house-line">House function</span>
          <span class="child-line">Child thread</span>
          <span class="local-line">Local builder work</span>
        </div>
      </p-card>
    </section>
  `,
  styles: [`
    .lesson-page {
      display: grid;
      gap: 1rem;
    }

    .lesson-header,
    .story-grid {
      display: grid;
      gap: .5rem;
    }

    .lesson-header {
      max-width: 58rem;
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
      color: #111827;
      font-size: 1rem;
      line-height: 1.35;
    }

    p {
      color: #4b5563;
      line-height: 1.6;
    }

    .story-grid {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 1rem;
    }

    .node-label {
      color: #2563eb;
      font-size: .75rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .summary-strip {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      justify-content: end;
    }

    .summary-strip span {
      min-width: 7rem;
      padding: .65rem .75rem;
      border-radius: .5rem;
      background: #f8fafc;
      color: #475569;
      display: grid;
      gap: .15rem;
      font-size: .75rem;
      font-weight: 800;
      text-align: center;
    }

    .summary-strip strong {
      color: #111827;
      font-size: 1.05rem;
    }

    :host ::ng-deep .chart-card .p-card-body {
      padding: 1rem;
    }

    .chart-title {
      display: grid;
      gap: .2rem;
      margin-bottom: .85rem;
    }

    .chart-title strong {
      color: #111827;
      font-size: 1rem;
    }

    .thread-chart {
      --time-columns: repeat(30, minmax(0, 1fr));
      display: grid;
      gap: .22rem;
      padding: .75rem;
      border: 1px solid #dbeafe;
      border-radius: .65rem;
      background: #ffffff;
    }

    .chart-header,
    .chart-row {
      display: grid;
      grid-template-columns: 10rem minmax(0, 1fr);
      gap: .6rem;
      align-items: center;
    }

    .chart-header > span,
    .chart-row > strong {
      min-width: 0;
      border-radius: .4rem;
      display: grid;
      align-items: center;
      font-size: .72rem;
      font-weight: 800;
    }

    .chart-header > span {
      padding: .25rem .5rem;
      background: #eef2ff;
      color: #1d4ed8;
      text-transform: uppercase;
    }

    .chart-row > strong {
      min-height: 1.45rem;
      padding: .18rem .5rem;
      background: #f8fafc;
      color: #334155;
    }

    .chart-row.level-child > strong {
      padding-left: 1.1rem;
      color: #64748b;
      font-size: .66rem;
    }

    .chart-row.level-house > strong {
      padding-left: .75rem;
    }

    .chart-row.related > strong {
      background: #dbeafe;
      color: #1d4ed8;
      box-shadow: inset .22rem 0 0 #2563eb;
    }

    .chart-row.dimmed > strong {
      opacity: .38;
    }

    .week-scale,
    .line-track {
      min-width: 0;
      display: grid;
      grid-template-columns: var(--time-columns);
      gap: .08rem;
      align-items: center;
    }

    .week-scale span {
      min-width: 0;
      color: #94a3b8;
      font-size: .55rem;
      font-weight: 800;
      text-align: center;
    }

    .week-scale span.major {
      color: #1d4ed8;
    }

    .line-track {
      min-height: 1.45rem;
      position: relative;
      background-image: linear-gradient(to right, rgb(226 232 240 / 80%) 1px, transparent 1px);
      background-size: calc(100% / 30) 100%;
      border-radius: .25rem;
    }

    .life-line {
      height: .62rem;
      border-radius: 999px;
      position: relative;
      cursor: default;
      transition: opacity .15s ease, box-shadow .15s ease, transform .15s ease;
    }

    .life-line.main-line,
    .legend .main-line {
      background: #2563eb;
    }

    .life-line.builder-line,
    .legend .builder-line {
      background: #0f766e;
    }

    .life-line.house-line,
    .legend .house-line {
      background: #64748b;
    }

    .life-line.child-line,
    .legend .child-line {
      background: #0284c7;
    }

    .life-line.local-line,
    .legend .local-line {
      background: #f59e0b;
    }

    .life-line.related {
      z-index: 3;
      box-shadow: 0 0 0 2px #111827, 0 .45rem 1rem rgb(15 23 42 / 20%);
      transform: scaleY(1.45);
    }

    .life-line.dimmed {
      opacity: .14;
    }

    .life-line:hover::after {
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

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      margin-top: .9rem;
      padding-top: .75rem;
      border-top: 1px solid #e5e7eb;
    }

    .legend span {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      color: #475569;
      font-size: .72rem;
      font-weight: 800;
    }

    .legend span::before {
      content: '';
      width: 1.6rem;
      height: .35rem;
      border-radius: 999px;
      background: currentColor;
    }

    @media (max-width: 900px) {
      .story-grid {
        grid-template-columns: 1fr;
      }

      .summary-strip {
        justify-content: start;
      }

      .chart-header,
      .chart-row {
        grid-template-columns: 7.5rem minmax(0, 1fr);
        gap: .4rem;
      }
    }
  `]
})
export class SequentialVsConcurrent2PageComponent {
  protected readonly weeks = Array.from({ length: 30 }, (_, index) => index + 1);
  protected readonly rows = this.buildRows();
  protected activeLineIds = new Set<string>();

  protected hasHighlight(): boolean {
    return this.activeLineIds.size > 0;
  }

  protected isLineHighlighted(line: TimelineLine): boolean {
    return this.activeLineIds.has(line.id);
  }

  protected isRowHighlighted(row: TimelineRow): boolean {
    return row.lines.some((line) => this.isLineHighlighted(line));
  }

  protected highlightLine(line: TimelineLine): void {
    this.activeLineIds = new Set([line.id, ...line.parentIds]);
  }

  protected clearHighlight(): void {
    this.activeLineIds = new Set<string>();
  }

  private buildRows(): TimelineRow[] {
    const rows: TimelineRow[] = [
      {
        id: 'main-row',
        label: 'Main',
        level: 'main',
        lines: [
          {
            id: 'main',
            label: 'main thread',
            detail: 'creates Builder 1 and Builder 2, then waits for both with join()',
            kind: 'main',
            start: 1,
            span: 30,
            parentIds: []
          }
        ]
      }
    ];

    for (const builder of [1, 2]) {
      const builderId = `builder-${builder}`;
      const firstHouse = builder === 1 ? 1 : 6;

      rows.push({
        id: `${builderId}-row`,
        label: `Builder ${builder}`,
        level: 'builder',
        lines: [
          {
            id: builderId,
            label: `Builder ${builder} thread`,
            detail: `builds H${firstHouse} to H${firstHouse + 4} one after another`,
            kind: 'builder',
            start: 1,
            span: 30,
            parentIds: ['main']
          }
        ]
      });

      for (let offset = 0; offset < 5; offset += 1) {
        const house = firstHouse + offset;
        const houseId = `house-${house}`;
        const start = offset * 6 + 1;
        const parentIds = [builderId, 'main'];

        rows.push({
          id: `${houseId}-row`,
          label: `H${house}`,
          level: 'house',
          lines: [
            {
              id: houseId,
              label: `buildHouse(H${house})`,
              detail: `runs inside Builder ${builder}; owns order-window, order-door, brick, install work`,
              kind: 'house',
              start,
              span: 6,
              parentIds
            }
          ]
        });

        rows.push(
          this.childRow(house, 'OW', 'order window thread', 'waits for supplier windows for 5 weeks', start, 5, [
            houseId,
            ...parentIds
          ]),
          this.childRow(house, 'OD', 'order door thread', 'waits for supplier doors for 5 weeks', start, 5, [
            houseId,
            ...parentIds
          ]),
          this.childRow(house, 'LB', 'lay bricks thread', 'brick work finishes after 2 weeks', start, 2, [
            houseId,
            ...parentIds
          ]),
          this.childRow(house, 'IW', 'install window', 'local Builder work after child threads finish', start + 5, 1, [
            houseId,
            ...parentIds
          ], 'local'),
          this.childRow(house, 'ID', 'install door', 'local Builder work after installing the window', start + 5, 1, [
            houseId,
            ...parentIds
          ], 'local')
        );
      }
    }

    return rows;
  }

  private childRow(
    house: number,
    shortName: string,
    label: string,
    detail: string,
    start: number,
    span: number,
    parentIds: string[],
    kind: TimelineLineKind = 'child'
  ): TimelineRow {
    const id = `house-${house}-${shortName.toLowerCase()}`;

    return {
      id: `${id}-row`,
      label: `H${house} ${shortName}`,
      level: 'child',
      lines: [
        {
          id,
          label: `H${house} ${label}`,
          detail,
          kind,
          start,
          span,
          parentIds
        }
      ]
    };
  }
}

type TimelineRowLevel = 'main' | 'builder' | 'house' | 'child';
type TimelineLineKind = 'main' | 'builder' | 'house' | 'child' | 'local';

interface TimelineRow {
  id: string;
  label: string;
  level: TimelineRowLevel;
  lines: TimelineLine[];
}

interface TimelineLine {
  id: string;
  label: string;
  detail: string;
  kind: TimelineLineKind;
  start: number;
  span: number;
  parentIds: string[];
}
