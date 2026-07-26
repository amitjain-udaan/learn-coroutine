import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MenuModule, RouterLink],
  template: `
    <aside class="sidebar">
      <a class="brand" routerLink="/">
        <span class="brand-mark">LC</span>
        <span>Learn Coroutine</span>
      </a>

      <p-menu [model]="items" styleClass="nav-menu" />
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
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/'
    },
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-line'
    },
    {
      label: '01 What/Why?',
      icon: 'pi pi-book',
      routerLink: '/lessons/what-why',
      items: [
        {
          label: 'Thread',
          icon: 'pi pi-sitemap',
          routerLink: '/lessons/what-why/thread'
        }
      ]
    },
    {
      label: 'Lesson 2',
      icon: 'pi pi-book'
    },
    {
      label: 'Lesson 3',
      icon: 'pi pi-book'
    }
  ];
}
