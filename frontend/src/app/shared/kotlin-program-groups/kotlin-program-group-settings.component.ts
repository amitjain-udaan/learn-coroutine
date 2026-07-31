import { Component, Input } from '@angular/core';

import { KotlinProgram } from '../kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-kotlin-program-group-settings',
  standalone: true,
  template: `
    <section class="group-panel" [class.blue]="accent === 'blue'" [attr.aria-label]="ariaLabel">
      <header class="group-header">
        <div>
          <span class="group-label">{{ groupLabel }}</span>
          <strong>{{ selectedProgram.label }}</strong>
          <p>{{ selectedProgram.description }}</p>
        </div>

        <ng-content select="[settings-actions]" />
      </header>

      <ng-content />
    </section>
  `,
  styles: [`
    .group-panel {
      display: grid;
      gap: .875rem;
      width: 100%;
      padding: .875rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      border-left: .25rem solid #0f766e;
      background: #ffffff;
    }

    .group-panel.blue {
      border-color: #d1d5db;
      border-left-color: #2563eb;
      background: #ffffff;
    }

    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .group-header > div {
      min-width: 0;
    }

    .group-label {
      display: block;
      margin-bottom: .25rem;
      color: #0f766e;
      font-size: .75rem;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .blue .group-label {
      color: #1d4ed8;
    }

    strong {
      display: block;
      color: #111827;
      font-size: 1rem;
      line-height: 1.35;
    }

    p {
      margin: .35rem 0 0;
      color: #4b5563;
      line-height: 1.6;
    }

    @media (max-width: 760px) {
      .group-header {
        display: grid;
      }
    }
  `]
})
export class KotlinProgramGroupSettingsComponent {
  @Input({ required: true }) groupLabel = '';
  @Input({ required: true }) selectedProgram!: KotlinProgram;
  @Input() ariaLabel = 'Kotlin program group settings';
  @Input() accent: 'teal' | 'blue' = 'teal';
}
