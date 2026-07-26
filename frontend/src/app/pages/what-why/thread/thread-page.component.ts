import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

import { ThreadDetailComponent } from '../../../shared/thread-detail/thread-detail.component';

@Component({
  selector: 'app-thread-page',
  standalone: true,
  imports: [CardModule, DialogModule, TagModule, ThreadDetailComponent],
  template: `
    <section class="thread-page">
      <header class="page-header">
        <p-tag value="01 What/Why?" severity="info" />
        <h2>Thread</h2>
        <p>
          Before understanding threads, start with the path from a saved program to a running process.
        </p>
      </header>

      <p-card>
        <div class="os-diagram" aria-label="Program to process to thread diagram">
          <div class="diagram-node program-node">
            <span class="node-label">Program</span>
            <strong>Set of instructions</strong>
            <small>Stored on disk</small>
          </div>

          <span class="arrow pi pi-arrow-right" aria-hidden="true"></span>

          <div class="diagram-node process-node">
            <span class="node-label">Process</span>
            <strong>Program in execution</strong>
            <small>Created by the OS</small>

            <div class="process-body">
              <div class="process-layout" aria-label="Typical process memory layout">
                <span>Stack</span>
                <span>Heap</span>
                <span>Data</span>
                <span>Code / Text</span>
              </div>

              <div class="process-resources">
                <span>Open files</span>
                <span>Network sockets</span>
                <span>CPU scheduling</span>
              </div>
            </div>

            <div class="thread-list" aria-label="Multiple threads inside a process">
              <div class="thread-box">
                Thread 1
              </div>
              <div class="thread-box">
                Thread 2
              </div>
              <div class="thread-box">
                Thread 3
              </div>
            </div>
          </div>

          <span class="arrow pi pi-arrow-right" aria-hidden="true"></span>

          <div
            class="diagram-node thread-node"
            role="button"
            tabindex="0"
            aria-label="Open thread detail"
            (click)="openThreadDetail()"
            (keydown.enter)="openThreadDetail()"
            (keydown.space)="openThreadDetail()">
            <span class="node-label">Thread</span>
            <strong>Execution path</strong>
            <small>Click for more detail</small>

            <div class="thread-state-preview">
              <span>Program counter</span>
              <span>Registers</span>
              <span>Stack</span>
            </div>
          </div>
        </div>
      </p-card>

      <p-dialog
        header="Thread"
        [(visible)]="isThreadDetailOpen"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [style]="{ width: 'min(38rem, 92vw)' }">
        <app-thread-detail />
      </p-dialog>

      <div class="lesson-grid">
        <p-card>
          <h3>Program</h3>
          <p>
            A program is a set of instructions stored on disk. It is passive until the operating system
            loads it and starts running it.
          </p>
        </p-card>

        <p-card>
          <h3>Process</h3>
          <p>
            A process is a program in execution. In a typical OS diagram, it owns an address space made
            of code/text, data, heap, and stack, plus resources such as open files and network sockets.
          </p>
        </p-card>

        <p-card>
          <h3>Thread</h3>
          <p>
            A thread is the execution path inside a process. A process can have one or many threads,
            and each thread has its own program counter, registers, and stack while sharing the process
            code, data, heap, and OS resources.
          </p>
        </p-card>
      </div>

      <p-card>
        <h3>Why it matters for coroutines</h3>
        <p>
          Coroutines do not replace the OS process. They are lightweight work units that run on threads.
          A coroutine can suspend without blocking the thread, so the same thread can continue doing other work.
        </p>
        <pre><code>Program -> Process -> Thread -> Coroutine work

Process: code/text + data + heap + resources
Thread: program counter + registers + stack

Thread.sleep(1000) blocks the thread
delay(1000) suspends the coroutine</code></pre>
      </p-card>
    </section>
  `,
  styles: [`
    .thread-page {
      display: grid;
      gap: 1rem;
    }

    .page-header {
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

    small {
      color: #6b7280;
      font-size: .8125rem;
    }

    .os-diagram {
      display: grid;
      grid-template-columns: minmax(9.5rem, .8fr) 2rem minmax(24rem, 1.8fr) 2rem minmax(11rem, .9fr);
      gap: .85rem;
      align-items: center;
    }

    .diagram-node {
      min-height: 12rem;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: .5rem;
      background: #ffffff;
      display: grid;
      align-content: start;
      gap: .5rem;
    }

    .program-node {
      border-top: .25rem solid #2563eb;
    }

    .process-node {
      border-top: .25rem solid #059669;
    }

    .thread-node {
      border-top: .25rem solid #d97706;
      cursor: pointer;
      transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
    }

    .thread-node:hover,
    .thread-node:focus-visible {
      border-color: #d97706;
      box-shadow: 0 10px 24px rgb(17 24 39 / 12%);
      outline: 0;
      transform: translateY(-1px);
    }

    .node-label {
      color: #6b7280;
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .process-body {
      display: grid;
      grid-template-columns: minmax(8rem, .9fr) minmax(9rem, 1fr);
      gap: .75rem;
      margin-top: .5rem;
      align-items: stretch;
    }

    .process-layout {
      display: grid;
      gap: .35rem;
      padding: .5rem;
      border: 1px solid #d1fae5;
      border-radius: .5rem;
      background: #f0fdf4;
    }

    .process-layout span {
      min-height: 1.9rem;
      padding: .35rem .5rem;
      border-radius: .375rem;
      background: #ffffff;
      color: #065f46;
      font-size: .8125rem;
      font-weight: 700;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .process-resources {
      display: grid;
      gap: .4rem;
    }

    .process-resources span {
      min-height: 2rem;
      padding: .4rem .5rem;
      border-radius: .375rem;
      background: #f3f4f6;
      color: #374151;
      font-size: .8125rem;
      font-weight: 600;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .thread-state-preview {
      display: grid;
      gap: .5rem;
      margin-top: .5rem;
    }

    .thread-state-preview span {
      min-height: 2rem;
      padding: .4rem .5rem;
      border-radius: .375rem;
      background: #fffbeb;
      color: #92400e;
      font-size: .8125rem;
      font-weight: 700;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .thread-list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .5rem;
      margin-top: .75rem;
    }

    .thread-box {
      min-width: 0;
      min-height: 2.5rem;
      padding: .45rem .55rem;
      border: 1px solid #fde68a;
      border-radius: .5rem;
      background: #fffbeb;
      color: #92400e;
      font-size: .8125rem;
      font-weight: 700;
      display: grid;
      place-items: center;
      text-align: center;
    }

    .arrow {
      color: #6b7280;
      font-size: 1.25rem;
    }

    .lesson-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      gap: 1rem;
    }

    pre {
      overflow-x: auto;
      margin: 1rem 0 0;
      max-width: 100%;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
      padding: 1rem;
      border-radius: .5rem;
      background: #111827;
      color: #f9fafb;
      font-size: .875rem;
      line-height: 1.6;
    }

    @media (max-width: 900px) {
      .os-diagram {
        grid-template-columns: 1fr;
      }

      .process-body {
        grid-template-columns: 1fr;
      }

      .thread-list {
        grid-template-columns: 1fr;
      }

      .arrow {
        transform: rotate(90deg);
        justify-self: center;
      }
    }
  `]
})
export class ThreadPageComponent {
  protected isThreadDetailOpen = false;

  protected openThreadDetail(): void {
    this.isThreadDetailOpen = true;
  }
}
