import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-surface border-t border-border mt-auto pt-12 pb-7">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-1 gap-8 min-[860px]:grid-cols-[1.4fr_1fr_1fr]">
          <!-- Brand -->
          <div>
            <div class="flex items-center gap-2.5 mb-2.5">
              <svg class="w-[34px] h-[34px]" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="19" fill="none" stroke="#0F6B5C" stroke-width="2" />
                <path
                  d="M20 8 L20 24 M13 14 L27 14"
                  stroke="#0F6B5C"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <path
                  d="M14 22 Q20 34 26 22"
                  fill="none"
                  stroke="#C08A28"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
              </svg>
              <span class="font-display font-semibold text-[18px] text-foreground"
                >IDDP Región Norte Chico</span
              >
            </div>
            <p class="text-[13px] text-muted max-w-[280px]">
              Iglesia de Dios del Perú — Región Norte Chico. Sirviendo a Barranca, Huaura y Huaral.
            </p>
            <div class="flex gap-2.5 mt-3.5">
              <a
                href="#"
                aria-label="Facebook"
                class="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1C2321"
                  stroke-width="2"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                class="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1C2321"
                  stroke-width="2"
                >
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Sitio -->
          <div>
            <h4 class="text-[13px] font-bold uppercase tracking-[.04em] text-muted mb-3.5">
              Sitio
            </h4>
            <a
              routerLink="/quienes-somos/historia"
              class="block text-sm text-foreground py-[5px] hover:text-primary transition-colors"
              >Quiénes somos</a
            >
            <a
              routerLink="/liderazgo/mujer"
              class="block text-sm text-foreground py-[5px] hover:text-primary transition-colors"
              >Liderazgo</a
            >
            <a
              routerLink="/ubicanos"
              class="block text-sm text-foreground py-[5px] hover:text-primary transition-colors"
              >Ubícanos</a
            >
          </div>

          <!-- Acceso -->
          <div>
            <h4 class="text-[13px] font-bold uppercase tracking-[.04em] text-muted mb-3.5">
              Acceso
            </h4>
            <a
              routerLink="/admin/login"
              class="block text-sm text-foreground py-[5px] hover:text-primary transition-colors"
              >Iniciar sesión</a
            >
            <a
              href="mailto:secretaria@iddp.pe"
              class="block text-sm text-foreground py-[5px] hover:text-primary transition-colors"
              >Contacto</a
            >
          </div>
        </div>

        <div class="mt-9 pt-5 border-t border-border text-xs text-muted text-center">
          © {{ year }} Iglesia de Dios del Perú — Región Norte Chico.
        </div>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {
  readonly year = new Date().getFullYear();
}
