import { Component } from '@angular/core';
import { TagModule } from 'primeng/tag';

import { KotlinPlaygroundComponent } from '../../shared/kotlin-playground/kotlin-playground.component';

@Component({
  selector: 'app-kotlin-editor-page',
  standalone: true,
  imports: [KotlinPlaygroundComponent, TagModule],
  template: `
    <section class="editor-page">
      <header class="page-header">
        <p-tag value="Kotlin Lab" severity="success" />
        <h2>Kotlin Playground</h2>
      </header>

      <app-kotlin-playground [startingCode]="helloWorldCode" />
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

  `]
})
export class KotlinEditorPageComponent {
  protected readonly helloWorldCode = `fun main() {
    println("Hello, world!")
}`;
}
