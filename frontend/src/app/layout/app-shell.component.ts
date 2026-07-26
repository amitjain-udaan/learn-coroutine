import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { DrawingOverlayComponent } from '../shared/drawing-overlay/drawing-overlay.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, DrawingOverlayComponent],
  template: `
    <div class="shell">
      <app-sidebar />
      <div class="main">
        <app-topbar />
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-drawing-overlay />
  `,
  styles: [`
    .shell {
      display: grid;
      grid-template-columns: 16rem minmax(0, 1fr);
      min-height: 100vh;
    }

    .main {
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .content {
      width: 100%;
      max-width: 72rem;
      padding: 1.5rem;
    }

    @media (max-width: 760px) {
      .shell {
        grid-template-columns: 1fr;
      }

      .content {
        padding: 1rem;
      }
    }
  `]
})
export class AppShellComponent {}
