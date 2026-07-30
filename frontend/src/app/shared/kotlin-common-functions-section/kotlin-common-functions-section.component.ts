import { Component, Input } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';

import { KotlinCodeViewerComponent } from '../kotlin-code-viewer/kotlin-code-viewer.component';

@Component({
  selector: 'app-kotlin-common-functions-section',
  standalone: true,
  imports: [AccordionModule, CardModule, KotlinCodeViewerComponent],
  template: `
    <p-card>
      <h3>Common functions used in this section</h3>
      <p>
        These helpers keep the examples focused on the scenario. Expand this when you want to inspect
        the shared thread tracking, timing, logging, and summary code.
      </p>

      <p-accordion value="none">
        <p-accordion-panel value="common-functions">
          <p-accordion-header>Common Kotlin helpers</p-accordion-header>
          <p-accordion-content>
            <app-kotlin-code-viewer [code]="code" />
          </p-accordion-content>
        </p-accordion-panel>
      </p-accordion>
    </p-card>
  `,
  styles: [`
    h3,
    p {
      margin: 0;
    }

    h3 {
      margin-bottom: .75rem;
      color: #111827;
      font-size: 1rem;
      line-height: 1.35;
    }

    p {
      color: #4b5563;
      line-height: 1.6;
    }

    :host ::ng-deep .p-accordion {
      margin-top: 1rem;
    }
  `]
})
export class KotlinCommonFunctionsSectionComponent {
  @Input({ required: true }) code = '';
}
