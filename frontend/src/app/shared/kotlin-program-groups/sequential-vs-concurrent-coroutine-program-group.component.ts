import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { KotlinProgramGroupSettingsComponent } from './kotlin-program-group-settings.component';
import {
  BuilderProgramConfig,
  DEFAULT_BUILDER_PROGRAM_CONFIG,
  KotlinProgram
} from '../kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-sequential-vs-concurrent-coroutine-program-group',
  standalone: true,
  imports: [FormsModule, KotlinProgramGroupSettingsComponent],
  template: `
    <section class="group-content" aria-label="Sequential versus concurrent coroutine program group">
      <app-kotlin-program-group-settings
        groupLabel="Sequential VS Concurrent - Coroutine"
        ariaLabel="Sequential versus concurrent coroutine program settings"
        [selectedProgram]="selectedProgram"
      >
        <div class="timing-grid" aria-label="Editable coroutine scenario timing">
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
      </app-kotlin-program-group-settings>
    </section>
  `,
  styles: [`
    .group-content {
      display: grid;
      gap: 1rem;
    }

    .timing-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .75rem;
    }

    .timing-grid label {
      min-width: 0;
      padding: .65rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #f9fafb;
      display: grid;
      grid-template-columns: 1fr;
      gap: .35rem;
    }

    .timing-grid label span,
    small {
      color: #374151;
      font-size: .8125rem;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-height: 2.35rem;
      padding: .45rem .55rem;
      border: 1px solid #d1d5db;
      border-radius: .375rem;
      color: #111827;
      font: inherit;
    }

    input:focus {
      border-color: #2563eb;
      outline: 2px solid #bfdbfe;
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
export class SequentialVsConcurrentCoroutineProgramGroupComponent {
  @Input({ required: true }) selectedProgram!: KotlinProgram;
  @Input() programConfig: BuilderProgramConfig = DEFAULT_BUILDER_PROGRAM_CONFIG;
  @Output() programConfigChange = new EventEmitter<BuilderProgramConfig>();

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
}
