import { Component, Input } from '@angular/core';

import { KotlinCommonFunctionsSectionComponent } from '../kotlin-common-functions-section/kotlin-common-functions-section.component';
import { COMMON_FUNCTIONS_CODE, KotlinProgram } from '../kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-sequential-vs-concurrent-program-group',
  standalone: true,
  imports: [KotlinCommonFunctionsSectionComponent],
  template: `
    <section class="group-content" aria-label="Sequential versus concurrent program group">
      <div class="group-panel">
        <div>
          <span class="group-label">Sequential VS Concurrent</span>
          <strong>{{ selectedProgram.label }}</strong>
        </div>

        <p>{{ selectedProgram.description }}</p>

        <div class="scenario-hints" aria-label="Scenario constants">
          <span>1 week = 1000 ms</span>
          <span>Window order = 5 weeks</span>
          <span>Door order = 5 weeks</span>
        </div>
      </div>

      <app-kotlin-common-functions-section [code]="commonFunctionsCode" />
    </section>
  `,
  styles: [`
    .group-content {
      display: grid;
      gap: 1rem;
    }

    .group-panel {
      display: grid;
      gap: .75rem;
      max-width: 42rem;
      padding: 1rem;
      border: 1px solid #ccfbf1;
      border-radius: .5rem;
      border-top: .25rem solid #0f766e;
      background: #f0fdfa;
    }

    .group-label {
      display: block;
      margin-bottom: .35rem;
      color: #0f766e;
      font-size: .75rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    strong {
      color: #111827;
    }

    p {
      margin: 0;
      color: #4b5563;
      line-height: 1.6;
    }

    .scenario-hints {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
    }

    .scenario-hints span {
      padding: .4rem .55rem;
      border: 1px solid #99f6e4;
      border-radius: .5rem;
      background: #ffffff;
      color: #0f766e;
      font-size: .8125rem;
      font-weight: 700;
    }
  `]
})
export class SequentialVsConcurrentProgramGroupComponent {
  @Input({ required: true }) selectedProgram!: KotlinProgram;

  protected readonly commonFunctionsCode = COMMON_FUNCTIONS_CODE;
}
