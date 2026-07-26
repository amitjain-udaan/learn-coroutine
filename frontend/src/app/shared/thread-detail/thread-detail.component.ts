import { Component } from '@angular/core';

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  template: `
    <section class="thread-detail">
      <p>
        A thread is an execution path inside a process. The operating system schedules threads on the CPU.
      </p>

      <div class="thread-state">
        <span>Program counter</span>
        <span>Registers</span>
        <span>Stack</span>
      </div>

      <p>
        Each thread owns these pieces of execution state, while sharing the process code, data, heap,
        open files, and other resources with the process's other threads.
      </p>
    </section>
  `,
  styles: [`
    .thread-detail {
      display: grid;
      gap: 1rem;
    }

    p {
      margin: 0;
      color: #4b5563;
      line-height: 1.6;
    }

    .thread-state {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: .75rem;
    }

    .thread-state span {
      min-height: 2.75rem;
      padding: .65rem .75rem;
      border: 1px solid #fde68a;
      border-radius: .5rem;
      background: #fffbeb;
      color: #92400e;
      font-size: .875rem;
      font-weight: 700;
      display: grid;
      place-items: center;
      text-align: center;
    }
  `]
})
export class ThreadDetailComponent {}
