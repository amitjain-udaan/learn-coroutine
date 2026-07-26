import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [AvatarModule, ButtonModule, ToolbarModule],
  template: `
    <p-toolbar styleClass="topbar">
      <ng-template pTemplate="start">
        <div>
          <h1>Dashboard</h1>
          <span>Track Kotlin coroutine practice from one place.</span>
        </div>
      </ng-template>

      <ng-template pTemplate="end">
        <button pButton type="button" icon="pi pi-search" severity="secondary" text rounded aria-label="Search"></button>
        <button pButton type="button" icon="pi pi-bell" severity="secondary" text rounded aria-label="Notifications"></button>
        <p-avatar label="AJ" shape="circle" />
      </ng-template>
    </p-toolbar>
  `,
  styles: [`
    :host ::ng-deep .topbar {
      min-height: 4.75rem;
      padding: .75rem 1.5rem;
      border: 0;
      border-bottom: 1px solid #e5e7eb;
      border-radius: 0;
      background: #ffffff;
    }

    h1 {
      margin: 0;
      color: #111827;
      font-size: 1.25rem;
      line-height: 1.4;
    }

    span {
      color: #6b7280;
      font-size: .875rem;
    }

    @media (max-width: 760px) {
      :host ::ng-deep .topbar {
        padding: .75rem 1rem;
      }
    }
  `]
})
export class TopbarComponent {}
