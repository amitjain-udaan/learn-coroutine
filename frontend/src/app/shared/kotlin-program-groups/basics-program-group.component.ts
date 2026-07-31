import { Component, Input } from '@angular/core';

import { KotlinProgramGroupSettingsComponent } from './kotlin-program-group-settings.component';
import { KotlinProgram } from '../kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-basics-program-group',
  standalone: true,
  imports: [KotlinProgramGroupSettingsComponent],
  template: `
    <app-kotlin-program-group-settings
      groupLabel="Basics"
      accent="blue"
      ariaLabel="Basics program group"
      [selectedProgram]="selectedProgram"
    />
  `
})
export class BasicsProgramGroupComponent {
  @Input({ required: true }) selectedProgram!: KotlinProgram;
}
