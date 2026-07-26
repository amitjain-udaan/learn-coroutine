import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

type Lesson = {
  title: string;
  status: 'Ready' | 'In progress' | 'Queued';
  detail: string;
};

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CardModule, TagModule],
  template: `
    <section class="grid">
      @for (lesson of lessons; track lesson.title) {
        <p-card>
          <div class="lesson">
            <div>
              <h2>{{ lesson.title }}</h2>
              <p>{{ lesson.detail }}</p>
            </div>
            <p-tag [value]="lesson.status" [severity]="severityFor(lesson.status)" />
          </div>
        </p-card>
      }
    </section>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      gap: 1rem;
    }

    .lesson {
      min-height: 8rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
    }

    h2 {
      margin: 0 0 .5rem;
      color: #111827;
      font-size: 1rem;
      line-height: 1.35;
    }

    p {
      margin: 0;
      color: #6b7280;
      font-size: .875rem;
      line-height: 1.5;
    }
  `]
})
export class HomePageComponent {
  protected readonly lessons: Lesson[] = [
    {
      title: 'Coroutine Basics',
      status: 'Ready',
      detail: 'Launch, suspend, and structured concurrency fundamentals.'
    },
    {
      title: 'Dispatchers',
      status: 'In progress',
      detail: 'Practice moving work across CPU and IO execution contexts.'
    },
    {
      title: 'Flows',
      status: 'Queued',
      detail: 'Explore cold streams, operators, collection, and cancellation.'
    }
  ];

  protected severityFor(status: Lesson['status']): 'success' | 'info' | 'warn' {
    const severityByStatus: Record<Lesson['status'], 'success' | 'info' | 'warn'> = {
      Ready: 'success',
      'In progress': 'info',
      Queued: 'warn'
    };

    return severityByStatus[status];
  }
}
