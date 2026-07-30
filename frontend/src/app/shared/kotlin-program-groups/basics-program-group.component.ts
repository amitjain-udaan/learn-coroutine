import { Component, Input } from '@angular/core';

import { KotlinProgram } from '../kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-basics-program-group',
  standalone: true,
  template: `
    <section class="group-panel" aria-label="Basics program group">
      <span class="group-label">Basics</span>
      <strong>{{ selectedProgram.label }}</strong>
      <p>{{ selectedProgram.description }}</p>
    </section>
  `,
  styles: [`
    .group-panel {
      display: grid;
      gap: .35rem;
      max-width: 42rem;
      padding: 1rem;
      border: 1px solid #dbeafe;
      border-radius: .5rem;
      border-top: .25rem solid #2563eb;
      background: #eff6ff;
    }

    .group-label {
      color: #1d4ed8;
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
  `]
})
export class BasicsProgramGroupComponent {
  @Input({ required: true }) selectedProgram!: KotlinProgram;
}
