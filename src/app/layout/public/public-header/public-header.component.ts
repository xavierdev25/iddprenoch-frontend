import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MobileDrawerComponent } from '../mobile-drawer/mobile-drawer.component';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MobileDrawerComponent],
  template: `
    <header class="sticky top-0 z-30 bg-background border-b border-border">
      <div class="max-w-6xl mx-auto px-4 h-[72px] flex items-center justify-between gap-6">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2.5 shrink-0 group">
          <img src="/logoIDDP.webp" alt="Logo IDDP" class="h-9 w-9 object-contain" />
          <span class="font-display font-semibold text-[18px] text-foreground hidden sm:block">
            IDDP · Región Norte Chico
          </span>
        </a>

        <!-- Nav desktop (≥860px) -->
        <nav
          class="hidden min-[860px]:flex items-center gap-0.5 flex-1 justify-center"
          aria-label="Navegación principal"
        >
          <a
            routerLink="/"
            routerLinkActive="text-primary font-semibold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-3 py-2 rounded text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Inicio
          </a>

          <!-- Dropdown Quiénes somos -->
          <div class="relative group">
            <button
              type="button"
              class="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium text-foreground hover:text-primary transition-colors group-hover:text-primary"
            >
              Quiénes somos
              <svg
                class="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              class="absolute top-full left-0 pt-1 invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                        transition-all duration-150 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
            >
              <div
                class="bg-surface border border-border rounded-[10px] shadow-[0_12px_24px_rgba(28,35,33,0.08)] py-1.5 min-w-[210px]"
              >
                <a
                  routerLink="/quienes-somos/directiva"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Directiva
                </a>
                <a
                  routerLink="/quienes-somos/mision-vision-valores"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Misión, Visión y Valores
                </a>
                <a
                  routerLink="/quienes-somos/historia"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Historia
                </a>
                <a
                  routerLink="/quienes-somos/principios-doctrinales"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Principios Doctrinales
                </a>
                <a
                  routerLink="/quienes-somos/que-creemos"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Qué Creemos
                </a>
              </div>
            </div>
          </div>

          <!-- Dropdown Liderazgo -->
          <div class="relative group">
            <button
              type="button"
              class="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium text-foreground hover:text-primary transition-colors group-hover:text-primary"
            >
              Liderazgo
              <svg
                class="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              class="absolute top-full left-0 pt-1 invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                        transition-all duration-150 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
            >
              <div
                class="bg-surface border border-border rounded-[10px] shadow-[0_12px_24px_rgba(28,35,33,0.08)] py-1.5 min-w-[210px]"
              >
                <a
                  routerLink="/liderazgo/mujer"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Ministerio de la Mujer
                </a>
                <a
                  routerLink="/liderazgo/varones"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Ministerio de Varones
                </a>
                <a
                  routerLink="/liderazgo/jovenes"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Jóvenes y Adolescentes
                </a>
                <a
                  routerLink="/liderazgo/infantil"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Ministerio Infantil
                </a>
                <a
                  routerLink="/liderazgo/musica"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Ministerio de Música
                </a>
                <a
                  routerLink="/liderazgo/social"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Proyección Social
                </a>
              </div>
            </div>
          </div>

          <!-- Dropdown Recursos -->
          <div class="relative group">
            <button
              type="button"
              class="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium text-foreground hover:text-primary transition-colors group-hover:text-primary"
            >
              Recursos
              <svg
                class="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              class="absolute top-full left-0 pt-1 invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                        transition-all duration-150 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
            >
              <div
                class="bg-surface border border-border rounded-[10px] shadow-[0_12px_24px_rgba(28,35,33,0.08)] py-1.5 min-w-[190px]"
              >
                <a
                  routerLink="/recursos/plan-estrategico"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Plan Estratégico
                </a>
                <a
                  routerLink="/recursos/plan-operativo"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Plan Operativo
                </a>
                <a
                  routerLink="/recursos/accesos-adicionales"
                  class="block px-3 py-[9px] rounded-md text-sm text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  Accesos Adicionales
                </a>
              </div>
            </div>
          </div>

          <a
            routerLink="/ubicanos"
            routerLinkActive="text-primary font-semibold"
            class="px-3 py-2 rounded text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Ubícanos
          </a>
        </nav>

        <!-- CTA desktop + hamburger -->
        <div class="flex items-center gap-2 shrink-0">
          <a
            routerLink="/admin/login"
            class="hidden min-[860px]:inline-flex items-center px-[18px] py-[9px] rounded bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            Iniciar sesión
          </a>

          <!-- Hamburger (mobile only) -->
          <button
            type="button"
            class="min-[860px]:hidden p-2 rounded text-foreground hover:bg-border/50 transition-colors"
            aria-label="Abrir menú"
            (click)="openDrawer()"
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
        </div>
      </div>
    </header>

    <app-mobile-drawer [isOpen]="drawerOpen()" (closed)="closeDrawer()" />
  `,
})
export class PublicHeaderComponent {
  drawerOpen = signal(false);

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
