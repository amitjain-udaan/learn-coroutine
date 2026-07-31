import { Component, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { DrawingOverlayComponent } from '../shared/drawing-overlay/drawing-overlay.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, DrawingOverlayComponent],
  template: `
    <div class="shell" [class.sidebar-closed]="!isSidebarOpen()">
      <app-sidebar
        [isOpen]="isSidebarOpen()"
        (closeSidebar)="closeSidebar()"
      />
      <div class="main">
        <app-topbar
          [isSidebarOpen]="isSidebarOpen()"
          (toggleSidebar)="toggleSidebar()"
        />
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

    .shell.sidebar-closed {
      grid-template-columns: 0 minmax(0, 1fr);
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

    .sidebar-closed .content {
      max-width: none;
    }

    @media (max-width: 760px) {
      .shell {
        grid-template-columns: 1fr;
      }

      .shell.sidebar-closed {
        grid-template-columns: 1fr;
      }

      .content {
        padding: 1rem;
      }
    }
  `]
})
export class AppShellComponent implements OnDestroy {
  protected readonly isSidebarOpen = signal(true);
  private readonly routerSubscription: Subscription;

  constructor(private readonly router: Router) {
    this.setSidebarForUrl(this.router.url);

    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.setSidebarForUrl(event.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  protected toggleSidebar(): void {
    this.isSidebarOpen.update((isOpen) => !isOpen);
  }

  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  private setSidebarForUrl(url: string): void {
    this.isSidebarOpen.set(!url.startsWith('/kotlin-editor'));
  }
}
