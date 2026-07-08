import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { EventosService } from '../../../core/services/eventos.service';
import { ComunicadosService } from '../../../core/services/comunicados.service';
import { IglesiaLocalizadorComponent } from '../shared/iglesia-localizador/iglesia-localizador.component';
import { EntityImageComponent } from '../../../shared/ui/entity-image/entity-image.component';
import { ImageLightboxComponent, LightboxImage } from '../../../shared/ui/image-lightbox/image-lightbox.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IglesiaLocalizadorComponent, EntityImageComponent, ImageLightboxComponent],
  template: `
    <!-- ═══ HERO ═══ -->
    <section class="relative overflow-hidden pt-[72px] pb-[88px]">
      <!-- Hero art: 3 círculos superpuestos semitransparentes (colores primary/secondary) -->
      <svg class="hero-art absolute -right-[60px] -top-[40px] w-[520px] h-[520px] -z-10 opacity-90 min-[860px]:block hidden"
           viewBox="0 0 400 400" aria-hidden="true">
        <circle cx="300" cy="120" r="160" fill="#0F6B5C" opacity=".08" />
        <circle cx="340" cy="220" r="90" fill="#C08A28" opacity=".12" />
        <circle cx="230" cy="60" r="50" fill="#0F6B5C" opacity=".14" />
      </svg>

      <div class="relative max-w-6xl mx-auto px-6">
        <div class="flex flex-col min-[860px]:flex-row items-stretch gap-8">
          <div class="max-w-[600px] flex flex-col justify-center items-start">
            <!-- Hero tag -->
            <span class="inline-block bg-background border border-secondary text-secondary text-xs font-semibold tracking-[.06em] uppercase px-3.5 py-1.5 rounded-full mb-[22px]">
              Convención regional 2026
            </span>

            <!-- Headline: solo "conectada" en italic + primary -->
            <h1 class="text-[36px] min-[860px]:text-[52px] leading-[1.15] tracking-[-.01em] text-foreground mb-[18px]">
              Una iglesia <em class="italic text-primary">conectada </em>con la misión de Cristo.
            </h1>

            <p class="text-muted text-[17px] leading-relaxed max-w-[480px]">
              Encuentra una iglesia cerca de ti, conoce nuestros ministerios, participa en los próximos eventos y sé parte de una comunidad que vive para Cristo.
            </p>

            <div class="flex flex-wrap gap-3.5 mt-8">
              <a
                href="#locator"
                class="inline-flex items-center px-6 py-[13px] rounded-[9px] bg-primary text-white font-semibold text-[15px] hover:bg-primary-hover transition-colors">
                Encuentra tu iglesia
              </a>
              <a
                href="#eventos"
                class="inline-flex items-center px-6 py-[13px] rounded-[9px] border border-border font-semibold text-[15px] hover:border-foreground transition-colors">
                Próximos eventos
              </a>
            </div>
          </div>

          <div class="w-full min-[860px]:w-[460px] shrink-0">
            <img
              src="/imageHero.webp"
              alt="Comunidad de la iglesia reunida"
              class="w-full h-full min-h-[280px] rounded-[18px] object-contain" />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ ENCUENTRA TU IGLESIA (elemento signature — tema oscuro) ═══ -->
    <section id="locator" class="bg-foreground text-white py-16">
      <div class="max-w-6xl mx-auto px-6">
        <div class="mb-7">
          <h2 class="text-white text-[30px] mb-1.5">Encuentra tu iglesia</h2>
          <p class="text-[#B9C0BC] text-sm">18 congregaciones en 6 distritos de la Región Norte Chico.</p>
        </div>
        <app-iglesia-localizador />
      </div>
    </section>

    <!-- ═══ PRÓXIMOS EVENTOS ═══ -->
    <section id="eventos" class="py-[72px] bg-background">
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex items-end justify-between mb-7">
          <h2 class="text-[30px] text-foreground">Próximos eventos</h2>
          <a href="#" class="text-sm font-semibold text-primary">Ver todos →</a>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (evento of eventos(); track evento.id) {
            <div class="border border-border rounded-[14px] overflow-hidden bg-surface">
              <div class="h-[140px] overflow-hidden">
                @if (evento.imagen) {
                  <img
                    [src]="evento.imagen"
                    [alt]="evento.nombre"
                    class="w-full h-full object-cover cursor-pointer"
                    (click)="openLightbox(evento.imagen, evento.nombre)" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center" style="background:linear-gradient(135deg, #0F6B5C, #17493f)">
                    <span class="text-white/85 font-display italic text-[15px]">{{ evento.nombre }}</span>
                  </div>
                }
              </div>
              <div class="p-[18px]">
                <p class="text-secondary text-xs font-bold uppercase tracking-[.04em]">
                  {{ formatDay(evento.fechaConHora) }} {{ formatMonth(evento.fechaConHora) }}
                  @if (evento.ubicacion) { · {{ evento.ubicacion }} }
                </p>
                <h3 class="text-[17px] font-semibold mt-1.5" style="font-family: var(--font-sans)">{{ evento.nombre }}</h3>
                @if (evento.descripcion) {
                  <p class="text-[13px] text-muted mt-1.5">{{ evento.descripcion }}</p>
                }
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-8 text-center text-muted text-sm">
              No hay eventos próximos programados.
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══ COMUNICADOS ═══ -->
    <section class="py-[72px] bg-surface border-t border-border">
      <div class="max-w-6xl mx-auto px-6">
        <h2 class="text-[30px] text-foreground mb-7">
          Comunicados
        </h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (c of comunicados(); track c.id) {
            <div class="border border-border rounded-lg overflow-hidden bg-surface hover:border-primary/30 transition-colors">
              <app-entity-image
                [src]="c.imagen"
                [alt]="c.titulo"
                class="w-full h-28"
                (imageClick)="openLightbox(c.imagen!, c.titulo)" />
              <div class="p-5">
                <h3 class="text-[17px] font-semibold text-foreground mb-2" style="font-family: var(--font-sans)">{{ c.titulo }}</h3>
                @if (c.descripcion) {
                  <p class="text-xs text-muted leading-relaxed line-clamp-3">{{ c.descripcion }}</p>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <app-image-lightbox [image]="lightboxImage()" (closed)="lightboxImage.set(null)" />
  `,
})
export class HomeComponent {
  private readonly eventosService = inject(EventosService);
  private readonly comunicadosService = inject(ComunicadosService);

  eventos = toSignal(this.eventosService.getProximos(4), { initialValue: [] });
  comunicados = toSignal(this.comunicadosService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  lightboxImage = signal<LightboxImage | null>(null);

  openLightbox(src: string, caption: string): void {
    this.lightboxImage.set({ src, alt: caption, caption });
  }

  formatDay(dateStr: string): string {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  formatMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-PE', { month: 'short' }).toUpperCase();
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}
