import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { KotlinCommonFunctionsSectionComponent } from '../kotlin-common-functions-section/kotlin-common-functions-section.component';
import {
  BuilderProgramConfig,
  COMMON_FUNCTIONS_CODE,
  DEFAULT_BUILDER_PROGRAM_CONFIG,
  KotlinProgram
} from '../kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-sequential-vs-concurrent-program-group',
  standalone: true,
  imports: [FormsModule, KotlinCommonFunctionsSectionComponent],
  template: `
    <section class="group-content" aria-label="Sequential versus concurrent program group">
      <div class="group-panel">
        <div>
          <span class="group-label">Sequential VS Concurrent</span>
          <strong>{{ selectedProgram.label }}</strong>
        </div>

        <p>{{ selectedProgram.description }}</p>

        <div class="timing-grid" aria-label="Editable scenario timing">
          <label>
            <span>1 week is</span>
            <input
              type="number"
              min="100"
              step="100"
              [ngModel]="programConfig.timing.weekMillis"
              (ngModelChange)="updateTiming('weekMillis', $event)"
            />
            <small>ms</small>
          </label>

          <label>
            <span>Window order</span>
            <input
              type="number"
              min="0"
              step="0.5"
              [ngModel]="programConfig.timing.windowOrderWeeks"
              (ngModelChange)="updateTiming('windowOrderWeeks', $event)"
            />
            <small>weeks</small>
          </label>

          <label>
            <span>Door order</span>
            <input
              type="number"
              min="0"
              step="0.5"
              [ngModel]="programConfig.timing.doorOrderWeeks"
              (ngModelChange)="updateTiming('doorOrderWeeks', $event)"
            />
            <small>weeks</small>
          </label>

          <label>
            <span>Lay bricks</span>
            <input
              type="number"
              min="0"
              step="0.5"
              [ngModel]="programConfig.timing.brickWeeks"
              (ngModelChange)="updateTiming('brickWeeks', $event)"
            />
            <small>weeks</small>
          </label>

          <label>
            <span>Install window</span>
            <input
              type="number"
              min="0"
              step="0.5"
              [ngModel]="programConfig.timing.installWindowWeeks"
              (ngModelChange)="updateTiming('installWindowWeeks', $event)"
            />
            <small>weeks</small>
          </label>

          <label>
            <span>Install door</span>
            <input
              type="number"
              min="0"
              step="0.5"
              [ngModel]="programConfig.timing.installDoorWeeks"
              (ngModelChange)="updateTiming('installDoorWeeks', $event)"
            />
            <small>weeks</small>
          </label>
        </div>

        @if (selectedProgram.id === 'construction-company') {
          <div class="program-options" aria-label="Construction company options">
            <div>
              <span class="option-title">Construction company options</span>
              <p>These controls only affect the selected company program.</p>
            </div>

            <div class="timing-grid">
              <label>
                <span>Number of houses</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  [ngModel]="programConfig.company.houseCount"
                  (ngModelChange)="updateCompany('houseCount', $event)"
                />
                <small>houses</small>
              </label>

              <label>
                <span>Number of builders</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  [ngModel]="programConfig.company.builderCount"
                  (ngModelChange)="updateCompany('builderCount', $event)"
                />
                <small>builders</small>
              </label>
            </div>
          </div>
        }
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

    .timing-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .75rem;
    }

    .program-options {
      display: grid;
      gap: .75rem;
      padding-top: .75rem;
      border-top: 1px solid #99f6e4;
    }

    .option-title {
      display: block;
      margin-bottom: .35rem;
      color: #0f766e;
      font-size: .875rem;
      font-weight: 800;
    }

    label {
      min-width: 0;
      padding: .65rem;
      border: 1px solid #99f6e4;
      border-radius: .5rem;
      background: #ffffff;
      display: grid;
      grid-template-columns: 1fr;
      gap: .35rem;
    }

    label span,
    small {
      color: #0f766e;
      font-size: .8125rem;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-height: 2.35rem;
      padding: .45rem .55rem;
      border: 1px solid #99f6e4;
      border-radius: .375rem;
      color: #111827;
      font: inherit;
    }

    input:focus {
      border-color: #0f766e;
      outline: 2px solid #99f6e4;
      outline-offset: 1px;
    }

    @media (max-width: 900px) {
      .timing-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 560px) {
      .timing-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SequentialVsConcurrentProgramGroupComponent {
  @Input({ required: true }) selectedProgram!: KotlinProgram;
  @Input() programConfig: BuilderProgramConfig = DEFAULT_BUILDER_PROGRAM_CONFIG;
  @Output() programConfigChange = new EventEmitter<BuilderProgramConfig>();

  protected readonly commonFunctionsCode = COMMON_FUNCTIONS_CODE;

  protected updateTiming(key: keyof BuilderProgramConfig['timing'], value: number | string): void {
    const numericValue = Number(value);

    this.programConfigChange.emit({
      ...this.programConfig,
      timing: {
        ...this.programConfig.timing,
        [key]: Number.isFinite(numericValue) ? numericValue : 0
      }
    });
  }

  protected updateCompany(key: keyof BuilderProgramConfig['company'], value: number | string): void {
    const numericValue = Number(value);
    const normalizedValue = Math.max(1, Math.floor(Number.isFinite(numericValue) ? numericValue : 1));

    this.programConfigChange.emit({
      ...this.programConfig,
      company: {
        ...this.programConfig.company,
        [key]: normalizedValue
      }
    });
  }
}
