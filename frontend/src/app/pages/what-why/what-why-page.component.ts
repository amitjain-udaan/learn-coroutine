import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-what-why-page',
  standalone: true,
  imports: [CardModule, DividerModule, TagModule],
  template: `
    <section class="lesson-page">
      <header class="lesson-header">
        <p-tag value="Lesson 01" severity="info" />
        <h2>What/Why?</h2>
        <p>
          Coroutines are a way to write asynchronous, non-blocking code in a simple sequential style.
        </p>
      </header>

      <div class="lesson-grid">
        <p-card>
          <h3>What is a coroutine?</h3>
          <p>
            A coroutine is a lightweight unit of work that can suspend without blocking the thread it runs on.
            When the suspended work is ready again, it resumes from the same point.
          </p>
        </p-card>

        <p-card>
          <h3>Why use it?</h3>
          <p>
            Coroutines help keep async code readable while using system resources efficiently. They are useful
            for IO, network calls, timers, streams, and concurrent workflows.
          </p>
        </p-card>
      </div>

      <p-card>
        <h3>Blocking vs suspending</h3>
        <p>
          Blocking makes a thread wait. Suspending pauses only the coroutine, so the thread can do other work.
        </p>
        <p-divider />
        <pre><code>delay(1000) // suspends coroutine
Thread.sleep(1000) // blocks thread</code></pre>
      </p-card>
    </section>
  `,
  styles: [`
    .lesson-page {
      display: grid;
      gap: 1rem;
    }

    .lesson-header {
      display: grid;
      gap: .5rem;
      max-width: 48rem;
    }

    h2,
    h3,
    p {
      margin: 0;
    }

    h2 {
      color: #111827;
      font-size: 1.75rem;
      line-height: 1.25;
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

    .lesson-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      gap: 1rem;
    }

    pre {
      overflow-x: auto;
      margin: 0;
      padding: 1rem;
      border-radius: .5rem;
      background: #111827;
      color: #f9fafb;
      font-size: .875rem;
      line-height: 1.6;
    }
  `]
})
export class WhatWhyPageComponent {}
