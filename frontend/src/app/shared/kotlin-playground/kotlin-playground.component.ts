import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-kotlin-playground',
  standalone: true,
  template: `
    <iframe
      class="playground-frame"
      title="Kotlin Playground"
      sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
      [srcdoc]="playgroundDocument"
    ></iframe>
  `,
  styles: [`
    :host {
      display: block;
    }

    .playground-frame {
      width: 100%;
      min-height: 42rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
    }
  `]
})
export class KotlinPlaygroundComponent implements OnChanges {
  @Input() startingCode = `fun main() {
    println("Hello, world!")
}`;

  protected playgroundDocument: SafeHtml = '';

  constructor(private readonly sanitizer: DomSanitizer) {
    this.updatePlaygroundDocument();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startingCode']) {
      this.updatePlaygroundDocument();
    }
  }

  private updatePlaygroundDocument(): void {
    this.playgroundDocument = this.sanitizer.bypassSecurityTrustHtml(
      this.createPlaygroundDocument(this.startingCode)
    );
  }

  private createPlaygroundDocument(code: string): string {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      html,
      body {
        min-height: 100%;
        margin: 0;
        background: #ffffff;
        color: #111827;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        padding: 1rem;
      }

      pre {
        margin: 0;
      }

      code {
        display: block;
        min-height: 36rem;
        font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 14px;
        white-space: pre;
      }
    </style>
  </head>
  <body>
    <pre><code
        class="kotlin-code"
        data-target-platform="java"
        data-autocomplete="true"
        highlight-on-fly="true"
        auto-indent="true"
        lines="true"
        theme="darcula">${this.escapeHtml(code)}</code></pre>
    <script src="https://unpkg.com/kotlin-playground@1" data-selector=".kotlin-code"><\/script>
  </body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
