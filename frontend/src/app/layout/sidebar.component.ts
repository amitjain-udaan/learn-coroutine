import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ButtonModule, MenuModule, RouterLink],
  template: `
    <aside class="sidebar">
      <a class="brand" routerLink="/">
        <span class="brand-mark">LC</span>
        <span>Learn Coroutine</span>
      </a>

      <p-menu [model]="items" styleClass="nav-menu" />

      <button
        pButton
        type="button"
        icon="pi pi-plus"
        label="New Lesson"
        severity="contrast"
        class="new-button">
      </button>
    </aside>
  `,
  styles: [`
    .sidebar {
      min-height: 100vh;
      padding: 1rem;
      border-right: 1px solid #e5e7eb;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .brand {
      min-height: 2.75rem;
      display: flex;
      align-items: center;
      gap: .75rem;
      color: #111827;
      font-weight: 700;
      text-decoration: none;
    }

    .brand-mark {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: .5rem;
      display: grid;
      place-items: center;
      background: #111827;
      color: #ffffff;
      font-size: .875rem;
    }

    .new-button {
      width: 100%;
      justify-content: center;
      margin-top: auto;
    }

    :host ::ng-deep .nav-menu {
      width: 100%;
      border: 0;
      padding: 0;
    }

    @media (max-width: 760px) {
      .sidebar {
        min-height: auto;
        border-right: 0;
        border-bottom: 1px solid #e5e7eb;
      }
    }
  `]
})
export class SidebarComponent {
  protected readonly items: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/'
    },
    {
      label: 'Lessons',
      icon: 'pi pi-book'
    },
    {
      label: 'Exercises',
      icon: 'pi pi-code'
    }
  ];
}
