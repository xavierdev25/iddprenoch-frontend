import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { BreadcrumbJerarquicoComponent } from '../breadcrumb-jerarquico/breadcrumb-jerarquico.component';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [BreadcrumbJerarquicoComponent],
  template: `
    <header class="h-14 bg-surface border-b border-border flex items-center px-4 gap-4 shrink-0">
      <!-- Hamburger (mobile) -->
      <button
        type="button"
        class="lg:hidden p-1.5 rounded text-muted hover:text-foreground hover:bg-border/50 transition-colors"
        aria-label="Abrir menú lateral"
        (click)="toggleSidebar.emit()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Breadcrumb jerárquico -->
      <div class="flex-1 min-w-0">
        <app-breadcrumb-jerarquico [items]="breadcrumbService.items()" />
      </div>

      <!-- Usuario + logout -->
      <div class="flex items-center gap-3 shrink-0">
        @if (authService.currentUser(); as user) {
          <span class="text-sm text-muted hidden sm:block">{{ user.nombre }}</span>
        }
        <button
          type="button"
          (click)="authService.logout()"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-sm text-muted hover:text-foreground hover:bg-border/50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span class="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  `,
})
export class AdminTopbarComponent {
  toggleSidebar = output<void>();
  protected readonly authService = inject(AuthService);
  protected readonly breadcrumbService = inject(BreadcrumbService);
}
