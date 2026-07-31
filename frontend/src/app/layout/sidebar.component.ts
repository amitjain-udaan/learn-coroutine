import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ButtonModule, MenuModule, RouterLink],
  template: `
    <aside class="sidebar" [class.closed]="!isOpen" [attr.aria-hidden]="!isOpen">
      <div class="sidebar-header">
        <a class="brand" routerLink="/">
          <span class="brand-mark">LC</span>
          <span>Learn Coroutine</span>
        </a>

        <button
          pButton
          type="button"
          icon="pi pi-times"
          severity="secondary"
          [text]="true"
          [rounded]="true"
          aria-label="Close sidebar"
          (click)="closeSidebar.emit()">
        </button>
      </div>

      <p-menu [model]="items" styleClass="nav-menu" />
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 0;
      overflow: hidden;
    }

    .sidebar {
      width: 16rem;
      min-height: 100vh;
      padding: 1rem;
      border-right: 1px solid #e5e7eb;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform .2s ease, visibility .2s ease;
    }

    .sidebar.closed {
      visibility: hidden;
      transform: translateX(-100%);
    }

    .sidebar-header {
      min-height: 2.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
    }

    .brand {
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
        width: 100%;
        min-height: auto;
        border-right: 0;
        border-bottom: 1px solid #e5e7eb;
      }

      .sidebar.closed {
        display: none;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() closeSidebar = new EventEmitter<void>();

  protected readonly items: MenuItem[] = [
    {
      label: 'Main',
      items: [
        {
          label: 'Home',
          icon: 'pi pi-home',
          routerLink: '/'
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-chart-line',
          routerLink: '/'
        },
        {
          label: 'Kotlin Editor',
          icon: 'pi pi-code',
          routerLink: '/kotlin-editor'
        }
      ]
    },
    {
      label: 'Lessons',
      items: [
        {
          label: '01 What/Why?',
          icon: 'pi pi-book',
          routerLink: '/lessons/what-why'
        },
        {
          label: 'Thread',
          icon: 'pi pi-sitemap',
          routerLink: '/lessons/what-why/thread'
        },
        {
          label: 'Sequential VS Concurrent -1',
          icon: 'pi pi-sync',
          routerLink: '/lessons/what-why/concurrent-vs-sequential'
        },
        {
          label: 'Sequential VS Concurrent -2',
          icon: 'pi pi-sync',
          routerLink: '/lessons/what-why/sequential-vs-concurrent-2'
        },
        {
          label: 'Lesson 2',
          icon: 'pi pi-book',
          routerLink: '/'
        },
        {
          label: 'Lesson 3',
          icon: 'pi pi-book',
          routerLink: '/'
        }
      ]
    }
  ];
}
