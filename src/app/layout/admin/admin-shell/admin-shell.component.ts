import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from '../admin-topbar/admin-topbar.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminTopbarComponent],
  template: `
    <div class="flex h-screen bg-background overflow-hidden">
      <app-admin-sidebar [isOpen]="sidebarOpen()" (toggle)="toggleSidebar()" />
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        <app-admin-topbar (toggleSidebar)="toggleSidebar()" />
        <main class="flex-1 overflow-y-auto">
          <div class="p-6">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class AdminShellComponent {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
