import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { BasicsProgramGroupComponent } from '../../shared/kotlin-program-groups/basics-program-group.component';
import { SequentialVsConcurrentProgramGroupComponent } from '../../shared/kotlin-program-groups/sequential-vs-concurrent-program-group.component';
import { KotlinPlaygroundComponent } from '../../shared/kotlin-playground/kotlin-playground.component';
import {
  KOTLIN_PROGRAM_GROUPS,
  KOTLIN_PROGRAMS,
  KotlinProgram,
  KotlinProgramGroup
} from '../../shared/kotlin-programs/kotlin-programs';

@Component({
  selector: 'app-kotlin-editor-page',
  standalone: true,
  imports: [
    BasicsProgramGroupComponent,
    FormsModule,
    KotlinPlaygroundComponent,
    SelectModule,
    SequentialVsConcurrentProgramGroupComponent,
    TagModule
  ],
  template: `
    <section class="editor-page">
      <header class="page-header">
        <p-tag value="Kotlin Lab" severity="success" />
        <h2>Kotlin Playground</h2>
        <p>
          Select one of the lesson programs and run it directly in the playground.
        </p>
      </header>

      <div class="picker-grid">
        <div class="program-picker">
          <label for="group-select">Group</label>
          <p-select
            inputId="group-select"
            [options]="programGroups"
            [(ngModel)]="selectedGroupId"
            optionLabel="label"
            optionValue="id"
            placeholder="Select a group"
            styleClass="program-select"
            (onChange)="handleGroupChange()"
          />
        </div>

        <div class="program-picker">
          <label for="program-select">Program</label>
          <p-select
            inputId="program-select"
            [options]="filteredPrograms"
            [(ngModel)]="selectedProgramId"
            optionLabel="label"
            optionValue="id"
            placeholder="Select a program"
            styleClass="program-select"
          />
        </div>
      </div>

      @switch (selectedGroupId) {
        @case ('basics') {
          <app-basics-program-group [selectedProgram]="selectedProgram" />
        }
        @case ('sequential-vs-concurrent') {
          <app-sequential-vs-concurrent-program-group [selectedProgram]="selectedProgram" />
        }
      }

      <app-kotlin-playground [startingCode]="selectedProgram.code" />
    </section>
  `,
  styles: [`
    .editor-page {
      display: grid;
      gap: 1rem;
    }

    .page-header {
      display: grid;
      gap: .5rem;
      max-width: 48rem;
    }

    h2 {
      margin: 0;
      color: #111827;
      font-size: 1.75rem;
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: #4b5563;
      line-height: 1.6;
    }

    .picker-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
      max-width: 42rem;
    }

    .program-picker {
      display: grid;
      gap: .5rem;
    }

    .program-picker label {
      color: #374151;
      font-size: .875rem;
      font-weight: 700;
    }

    :host ::ng-deep .program-select {
      width: 100%;
    }

    @media (max-width: 760px) {
      .picker-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class KotlinEditorPageComponent {
  protected readonly programGroups: KotlinProgramGroup[] = KOTLIN_PROGRAM_GROUPS;
  protected readonly programs: KotlinProgram[] = KOTLIN_PROGRAMS;
  protected selectedGroupId = this.programGroups[0].id;
  protected selectedProgramId = this.filteredPrograms[0].id;

  protected get filteredPrograms(): KotlinProgram[] {
    return this.programs.filter((program) => program.groupId === this.selectedGroupId);
  }

  protected get selectedProgram(): KotlinProgram {
    return this.filteredPrograms.find((program) => program.id === this.selectedProgramId) ?? this.filteredPrograms[0];
  }

  protected handleGroupChange(): void {
    this.selectedProgramId = this.filteredPrograms[0].id;
  }
}
