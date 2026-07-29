import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-kotlin-code-viewer',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  template: `
    <section class="code-viewer" aria-label="Kotlin code viewer">
      <header class="code-toolbar">
        <span class="language-label">Kotlin</span>
        <button
          pButton
          type="button"
          class="copy-button"
          severity="secondary"
          [text]="true"
          [rounded]="true"
          [icon]="copied ? 'pi pi-check' : 'pi pi-copy'"
          [attr.aria-label]="copied ? 'Code copied' : 'Copy Kotlin code'"
          [pTooltip]="copied ? 'Copied' : 'Copy code'"
          tooltipPosition="left"
          (click)="copyCode()">
        </button>
      </header>

      <pre><code [innerHTML]="highlightedCode"></code></pre>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .code-viewer {
      overflow: hidden;
      margin-top: 1rem;
      border: 1px solid #1f2937;
      border-radius: .5rem;
      background: #111827;
    }

    .code-toolbar {
      min-height: 2.75rem;
      padding: .35rem .5rem .35rem .875rem;
      border-bottom: 1px solid #374151;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
    }

    .language-label {
      color: #d1d5db;
      font-size: .75rem;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    :host ::ng-deep .copy-button {
      color: #e5e7eb;
    }

    :host ::ng-deep .copy-button:hover {
      color: #ffffff;
      background: #374151;
    }

    pre {
      overflow-x: auto;
      margin: 0;
      max-width: 100%;
      padding: 1rem;
      background:
        linear-gradient(90deg, rgb(96 165 250 / 10%) 0 3px, transparent 3px),
        #111827;
      color: #d4d4d4;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: .875rem;
      line-height: 1.65;
      tab-size: 4;
    }

    code {
      white-space: pre;
    }

    :host ::ng-deep .token-keyword {
      color: #cc7832;
      font-weight: 700;
    }

    :host ::ng-deep .token-type {
      color: #ffc66d;
    }

    :host ::ng-deep .token-function {
      color: #a9b7c6;
      font-weight: 700;
    }

    :host ::ng-deep .token-variable {
      color: #9876aa;
    }

    :host ::ng-deep .token-string {
      color: #6a8759;
    }

    :host ::ng-deep .token-number {
      color: #6897bb;
    }

    :host ::ng-deep .token-comment {
      color: #808080;
      font-style: italic;
    }

    :host ::ng-deep .token-annotation {
      color: #bbb529;
    }

    :host ::ng-deep .token-operator {
      color: #a9b7c6;
    }
  `]
})
export class KotlinCodeViewerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) code = '';

  protected copied = false;
  protected highlightedCode = '';
  private copyResetTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly keywords = new Set([
    'as',
    'break',
    'catch',
    'class',
    'companion',
    'continue',
    'do',
    'else',
    'false',
    'finally',
    'for',
    'fun',
    'if',
    'import',
    'in',
    'interface',
    'is',
    'null',
    'object',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'suspend',
    'throw',
    'true',
    'try',
    'typealias',
    'val',
    'var',
    'when',
    'while'
  ]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code']) {
      this.highlightedCode = this.highlightKotlin(this.code);
    }
  }

  ngOnDestroy(): void {
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }
  }

  protected async copyCode(): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(this.code);
    } else {
      this.copyWithTextArea();
    }

    this.copied = true;

    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }

    this.copyResetTimer = setTimeout(() => {
      this.copied = false;
    }, 1500);
  }

  private copyWithTextArea(): void {
    const textArea = document.createElement('textarea');
    textArea.value = this.code;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';

    document.body.append(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }

  private highlightKotlin(code: string): string {
    const tokenPattern = /("""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])'|\/\/.*|\/\*[\s\S]*?\*\/|@[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|[{}()[\].,;:+\-*/%=!<>?&|]+)/g;
    let highlighted = '';
    let cursor = 0;

    for (const match of code.matchAll(tokenPattern)) {
      const token = match[0];
      const index = match.index ?? 0;

      highlighted += this.escapeHtml(code.slice(cursor, index));
      highlighted += this.renderToken(token, code.slice(index + token.length));
      cursor = index + token.length;
    }

    highlighted += this.escapeHtml(code.slice(cursor));
    return highlighted;
  }

  private renderToken(token: string, remainingCode: string): string {
    const escapedToken = this.escapeHtml(token);

    if (token.startsWith('//') || token.startsWith('/*')) {
      return this.wrapToken(escapedToken, 'comment');
    }

    if (token.startsWith('"') || token.startsWith("'")) {
      return this.wrapToken(escapedToken, 'string');
    }

    if (token.startsWith('@')) {
      return this.wrapToken(escapedToken, 'annotation');
    }

    if (/^\d/.test(token)) {
      return this.wrapToken(escapedToken, 'number');
    }

    if (this.keywords.has(token)) {
      return this.wrapToken(escapedToken, 'keyword');
    }

    if (/^[A-Z]/.test(token)) {
      return this.wrapToken(escapedToken, 'type');
    }

    if (/^[A-Za-z_]\w*$/.test(token) && remainingCode.trimStart().startsWith('(')) {
      return this.wrapToken(escapedToken, 'function');
    }

    if (/^[A-Za-z_]\w*$/.test(token)) {
      return this.wrapToken(escapedToken, 'variable');
    }

    return this.wrapToken(escapedToken, 'operator');
  }

  private wrapToken(token: string, tokenType: string): string {
    return `<span class="token-${tokenType}">${token}</span>`;
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
