import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DistritosService } from '../../../../core/services/distritos.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { PastoresService } from '../../../../core/services/pastores.service';
import { ChipComponent } from '../../../../shared/ui/chip/chip.component';
import { EntityImageComponent } from '../../../../shared/ui/entity-image/entity-image.component';
import { ImageLightboxComponent, LightboxImage } from '../../../../shared/ui/image-lightbox/image-lightbox.component';
import { Iglesia } from '../../../../core/models';
import { googleMapsUrl } from '../../../../core/utils/maps.util';

@Component({
  selector: 'app-iglesia-localizador',
  standalone: true,
  imports: [ChipComponent, EntityImageComponent, ImageLightboxComponent],
  template: `
    <div>
      <!-- Filtros por distrito -->
      <div class="flex flex-wrap gap-2 mb-7">
        <app-chip
          [active]="selectedDistritoId() === null"
          (selected)="selectDistrito(null)">
          Todos
        </app-chip>
        @for (d of distritos(); track d.id) {
          <app-chip
            [active]="selectedDistritoId() === d.id"
            (selected)="selectDistrito(d.id)">
            {{ d.nombre }}
          </app-chip>
        }
      </div>

      <!-- Grid de iglesias -->
      @if (filteredIglesias().length === 0) {
        <div class="py-12 text-center text-white/60 text-sm">
          No hay iglesias en este distrito.
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-3.5" [class]="compact() ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'">
          @for (iglesia of filteredIglesias(); track iglesia.id) {
            <div class="bg-[#232B28] border border-white/[.08] rounded-xl overflow-hidden">
              <app-entity-image
                [src]="iglesia.foto"
                [alt]="iglesia.nombre"
                class="w-full h-28"
                (imageClick)="openLightbox(iglesia)" />
              <div class="p-[18px]">
                <div class="text-[11px] font-semibold text-secondary tracking-[.04em] uppercase mb-2.5">
                  {{ distritoNombre(iglesia.distritoId) }}
                </div>
                <h3 class="text-white text-[17px] font-semibold" style="font-family: var(--font-sans)">{{ iglesia.nombre }}</h3>
                <p class="text-[#9AA39D] text-[13px] mt-1.5">
                  <span class="text-secondary mr-1">◆</span>Pastor {{ pastorNombre(iglesia.id) }}
                </p>
                <p class="text-[#9AA39D] text-[13px] mt-1.5">
                  <span class="text-secondary mr-1">◆</span>{{ iglesia.direccion }}
                </p>
                <a [href]="googleMapsUrl(iglesia)" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-1 text-secondary text-[13px] mt-2.5 hover:underline">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ver ubicación en Google Maps
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <app-image-lightbox [image]="lightboxImage()" (closed)="lightboxImage.set(null)" />
  `,
})
export class IglesiaLocalizadorComponent implements OnInit {
  compact = input<boolean>(false);

  protected readonly googleMapsUrl = googleMapsUrl;

  private readonly distritosService = inject(DistritosService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly pastoresService = inject(PastoresService);

  distritos = toSignal(this.distritosService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  pastores = toSignal(this.pastoresService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });

  selectedDistritoId = signal<number | null>(null);
  lightboxImage = signal<LightboxImage | null>(null);

  filteredIglesias = computed<Iglesia[]>(() => {
    const all = this.iglesias() ?? [];
    const id = this.selectedDistritoId();
    return id === null ? all : all.filter(i => i.distritoId === id);
  });

  ngOnInit(): void {}

  selectDistrito(id: number | null): void {
    this.selectedDistritoId.set(id);
  }

  distritoNombre(id: number): string {
    return this.distritos().find(d => d.id === id)?.nombre ?? 'Distrito';
  }

  pastorNombre(iglesiaId: number): string {
    return this.pastores().find(p => p.iglesiaId === iglesiaId)?.nombrePastor ?? '—';
  }

  openLightbox(iglesia: Iglesia): void {
    if (!iglesia.foto) return;
    this.lightboxImage.set({ src: iglesia.foto, alt: iglesia.nombre, caption: iglesia.nombre });
  }
}
