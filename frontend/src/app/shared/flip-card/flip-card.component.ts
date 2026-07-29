import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-flip-card',
  standalone: true,
  template: `
    <section class="flip-card" [class.flipped]="isFlipped">
      <div
        role="button"
        tabindex="0"
        class="flip-surface"
        [attr.aria-label]="isFlipped ? closeLabel : openLabel"
        [attr.aria-pressed]="isFlipped"
        (click)="toggle()"
        (keydown.enter)="toggle()"
        (keydown.space)="toggle()">
        <span class="flip-face flip-front">
          <ng-content select="[flip-card-front]" />
        </span>

        <span class="flip-face flip-back">
          <ng-content select="[flip-card-back]" />
        </span>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 0;
      height: 100%;
    }

    .flip-card {
      min-width: 0;
      height: 100%;
      perspective: 80rem;
    }

    .flip-surface {
      width: 100%;
      height: 100%;
      min-height: 100%;
      padding: 0;
      border: 0;
      border-radius: .5rem;
      background: transparent;
      color: inherit;
      cursor: pointer;
      display: grid;
      font: inherit;
      text-align: inherit;
      transform-style: preserve-3d;
      transition: transform .45s ease;
    }

    .flip-surface:focus-visible {
      outline: 3px solid #93c5fd;
      outline-offset: 3px;
    }

    .flipped .flip-surface {
      transform: rotateY(180deg);
    }

    .flip-face {
      min-width: 0;
      min-height: 100%;
      height: 100%;
      grid-area: 1 / 1;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      display: block;
    }

    .flip-back {
      transform: rotateY(180deg);
    }

    @media (prefers-reduced-motion: reduce) {
      .flip-surface {
        transition: none;
      }
    }
  `]
})
export class FlipCardComponent {
  @Input() openLabel = 'Flip card open';
  @Input() closeLabel = 'Flip card closed';

  protected isFlipped = false;

  protected toggle(): void {
    this.isFlipped = !this.isFlipped;
  }
}
