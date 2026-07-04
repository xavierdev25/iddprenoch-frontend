import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay mobile -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-20 bg-foreground/40 lg:hidden"
        (click)="toggle.emit()">
      </div>
    }

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 w-60 h-screen bg-foreground text-surface/80 flex flex-col transform transition-transform duration-200
             lg:static lg:translate-x-0 lg:z-auto"
      [class.translate-x-0]="isOpen()"
      [class.-translate-x-full]="!isOpen()">

      <!-- Logo -->
      <div class="px-4 py-4 border-b border-surface/10 shrink-0">
        <a routerLink="/admin/dashboard" class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded bg-primary flex items-center justify-center text-white font-display font-bold text-xs">
            I
          </div>
          <div class="leading-tight">
            <p class="text-surface font-semibold text-sm">IDDP Admin</p>
            <p class="text-surface/40 text-xs">Región Norte Chico</p>
          </div>
        </a>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        @for (section of sections; track section.label) {
          <div>
            <p class="px-2 mb-1.5 text-xs font-semibold uppercase tracking-widest text-surface/30">
              {{ section.label }}
            </p>
            <ul class="space-y-0.5">
              @for (item of section.items; track item.route) {
                <li>
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="bg-primary/90 text-white"
                    [routerLinkActiveOptions]="{ exact: item.route === '/admin/dashboard' }"
                    class="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors hover:bg-surface/10">
                    <span class="text-base leading-none">{{ item.icon }}</span>
                    {{ item.label }}
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </nav>

      <!-- Link al sitio público -->
      <div class="px-4 py-3 border-t border-surface/10 shrink-0">
        <a
          routerLink="/"
          class="flex items-center gap-2 text-xs text-surface/40 hover:text-surface/70 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Ver sitio público
        </a>
      </div>
    </aside>
  `,
})
export class AdminSidebarComponent {
  isOpen = input.required<boolean>();
  toggle = output<void>();

  readonly sections: NavSection[] = [
    {
      label: 'General',
      items: [
        { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
      ],
    },
    {
      label: 'Organización',
      items: [
        { label: 'Distritos', route: '/admin/distritos', icon: '🗺️' },
        { label: 'Iglesias', route: '/admin/iglesias', icon: '⛪' },
      ],
    },
    {
      label: 'Personal',
      items: [
        { label: 'Pastores', route: '/admin/pastores', icon: '👤' },
        { label: 'Líderes', route: '/admin/lideres', icon: '🌟' },
        { label: 'Congregantes', route: '/admin/congregantes', icon: '👥' },
      ],
    },
    {
      label: 'Ministerios',
      items: [
        { label: 'Ministerios', route: '/admin/ministerios', icon: '✝️' },
      ],
    },
    {
      label: 'Contenido',
      items: [
        { label: 'Eventos', route: '/admin/eventos', icon: '📅' },
        { label: 'Comunicados', route: '/admin/comunicados', icon: '📢' },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { label: 'Usuarios', route: '/admin/usuarios', icon: '🔐' },
      ],
    },
  ];
}
