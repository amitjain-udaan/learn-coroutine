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
          Bob now runs a construction company. The next step is to compare how multiple hired builders
          handle a larger contract when work can be split across houses.
        </p>
      </header>

      <p-card>
        <div class="scenario-grid" aria-label="Bob construction company second scenario">
          <div>
            <span class="node-label">Contract</span>
            <h3>10 similar houses</h3>
            <p>
              Each house has the same known workflow from part 1: supplier orders, brick work, then
              installation. The difference is that Bob is no longer the only worker.
            </p>
          </div>

          <div class="builder-summary">
            <div>
              <span class="node-label">Builder 1</span>
              <strong>Houses 1-5</strong>
            </div>
            <div>
              <span class="node-label">Builder 2</span>
              <strong>Houses 6-10</strong>
            </div>
          </div>
        </div>
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
      margin: .35rem 0 .75rem;
      color: #111827;
      font-size: 1rem;
      line-height: 1.35;
    }

    p {
      color: #4b5563;
      line-height: 1.6;
    }

    .scenario-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(18rem, .8fr);
      gap: 1rem;
      align-items: start;
    }

    .node-label {
      color: #6b7280;
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .builder-summary {
      display: grid;
      gap: .75rem;
    }

    .builder-summary div {
      min-height: 4rem;
      padding: 1rem;
      border: 1px solid #ccfbf1;
      border-radius: .5rem;
      border-top: .25rem solid #0f766e;
      background: #f0fdfa;
      display: grid;
      gap: .35rem;
    }

    .builder-summary strong {
      color: #0f766e;
      font-size: 1rem;
    }

    @media (max-width: 900px) {
      .scenario-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SequentialVsConcurrent2PageComponent {}
