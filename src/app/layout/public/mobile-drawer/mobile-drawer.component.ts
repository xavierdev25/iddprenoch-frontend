import { Component, HostListener, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type Section = 'quienes' | 'liderazgo' | 'recursos' | null;

@Component({
  selector: 'app-mobile-drawer',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (isOpen()) {
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-40 bg-foreground/40"
        (click)="closed.emit()">
      </div>

      <!-- Drawer panel -->
      <nav
        class="fixed top-0 right-0 z-50 h-full w-[82%] max-w-[340px] bg-surface flex flex-col overflow-hidden"
        role="navigation"
        aria-label="Menú principal">

        <!-- Header del drawer -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span class="font-display text-base font-semibold text-primary">IDDP Norte Chico</span>
          <button
            type="button"
            class="p-1.5 rounded text-muted hover:text-foreground hover:bg-border/50 transition-colors"
            aria-label="Cerrar menú"
            (click)="closed.emit()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Nav items -->
        <ul class="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          <li>
            <a
              routerLink="/"
              (click)="closed.emit()"
              class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-border/40 transition-colors">
              Inicio
            </a>
          </li>

          <!-- Quiénes somos — acordeón -->
          <li>
            <button
              type="button"
              class="flex w-full items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-border/40 transition-colors"
              [attr.aria-expanded]="openSection() === 'quienes'"
              (click)="toggleSection('quienes')">
              <span>Quiénes somos</span>
              <svg
                class="w-4 h-4 text-muted transition-transform duration-200"
                [class.rotate-180]="openSection() === 'quienes'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            @if (openSection() === 'quienes') {
              <ul class="ml-4 mt-1 pl-3 border-l-2 border-primary/25 space-y-0.5">
                <li>
                  <a routerLink="/quienes-somos/directiva" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Directiva
                  </a>
                </li>
                <li>
                  <a routerLink="/quienes-somos/mision-vision-valores" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Misión, Visión y Valores
                  </a>
                </li>
                <li>
                  <a routerLink="/quienes-somos/historia" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Historia
                  </a>
                </li>
                <li>
                  <a routerLink="/quienes-somos/principios-doctrinales" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Principios Doctrinales
                  </a>
                </li>
                <li>
                  <a routerLink="/quienes-somos/que-creemos" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Qué Creemos
                  </a>
                </li>
              </ul>
            }
          </li>

          <!-- Liderazgo — acordeón -->
          <li>
            <button
              type="button"
              class="flex w-full items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-border/40 transition-colors"
              [attr.aria-expanded]="openSection() === 'liderazgo'"
              (click)="toggleSection('liderazgo')">
              <span>Liderazgo</span>
              <svg
                class="w-4 h-4 text-muted transition-transform duration-200"
                [class.rotate-180]="openSection() === 'liderazgo'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            @if (openSection() === 'liderazgo') {
              <ul class="ml-4 mt-1 pl-3 border-l-2 border-primary/25 space-y-0.5">
                <li>
                  <a routerLink="/liderazgo/mujer" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Ministerio de la Mujer
                  </a>
                </li>
                <li>
                  <a routerLink="/liderazgo/varones" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Ministerio de Varones
                  </a>
                </li>
                <li>
                  <a routerLink="/liderazgo/jovenes" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Jóvenes y Adolescentes
                  </a>
                </li>
                <li>
                  <a routerLink="/liderazgo/infantil" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Ministerio Infantil
                  </a>
                </li>
                <li>
                  <a routerLink="/liderazgo/musica" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Ministerio de Música
                  </a>
                </li>
                <li>
                  <a routerLink="/liderazgo/social" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Proyección Social
                  </a>
                </li>
              </ul>
            }
          </li>

          <!-- Recursos — acordeón -->
          <li>
            <button
              type="button"
              class="flex w-full items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-border/40 transition-colors"
              [attr.aria-expanded]="openSection() === 'recursos'"
              (click)="toggleSection('recursos')">
              <span>Recursos</span>
              <svg
                class="w-4 h-4 text-muted transition-transform duration-200"
                [class.rotate-180]="openSection() === 'recursos'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            @if (openSection() === 'recursos') {
              <ul class="ml-4 mt-1 pl-3 border-l-2 border-primary/25 space-y-0.5">
                <li>
                  <a routerLink="/recursos/plan-estrategico" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Plan Estratégico
                  </a>
                </li>
                <li>
                  <a routerLink="/recursos/plan-operativo" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Plan Operativo
                  </a>
                </li>
                <li>
                  <a routerLink="/recursos/accesos-adicionales" (click)="closed.emit()"
                     class="block px-2 py-2 text-sm text-muted hover:text-primary transition-colors rounded">
                    Accesos Adicionales
                  </a>
                </li>
              </ul>
            }
          </li>

          <!-- Links planos -->
          <li>
            <a
              routerLink="/ubicanos"
              (click)="closed.emit()"
              class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-border/40 transition-colors">
              Ubícanos
            </a>
          </li>
        </ul>

        <!-- CTA iniciar sesión al fondo -->
        <div class="px-4 py-4 border-t border-border shrink-0">
          <a
            routerLink="/admin/login"
            (click)="closed.emit()"
            class="flex items-center justify-center w-full px-4 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors">
            Iniciar sesión
          </a>
        </div>
      </nav>
    }
  `,
})
export class MobileDrawerComponent {
  isOpen = input.required<boolean>();
  closed = output<void>();

  openSection = signal<Section>(null);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.closed.emit();
  }

  toggleSection(section: Section): void {
    this.openSection.update(current => (current === section ? null : section));
  }
}
