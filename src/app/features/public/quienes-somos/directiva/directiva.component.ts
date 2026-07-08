import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PastoresService } from '../../../../core/services/pastores.service';
import { CargosService } from '../../../../core/services/cargos.service';
import { DistritosService } from '../../../../core/services/distritos.service';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import {
  ImageLightboxComponent,
  LightboxImage,
} from '../../../../shared/ui/image-lightbox/image-lightbox.component';
import { Pastor } from '../../../../core/models';

@Component({
  selector: 'app-directiva',
  standalone: true,
  imports: [BadgeComponent, ImageLightboxComponent],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-12">
      <div class="mb-10">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">Organización</p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">Directiva Regional</h1>
        <p class="text-muted max-w-xl leading-relaxed">
          La directiva de la IDDP Región Norte Chico está integrada por pastores elegidos para guiar
          y servir a las congregaciones de la región.
        </p>
      </div>

      <!-- Cabeza regional: tratamiento destacado -->
      @if (obispoRegional(); as jefe) {
        <div
          class="bg-foreground rounded-xl p-7 mb-8 flex items-center gap-5 relative overflow-hidden"
        >
          <span
            class="absolute right-4 top-1/2 -translate-y-1/2 font-display text-[90px] leading-none text-white/[.05] select-none"
            aria-hidden="true"
            >✝</span
          >
          <div
            class="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0 relative overflow-hidden"
          >
            @if (jefe.foto) {
              <img
                [src]="jefe.foto"
                [alt]="jefe.nombrePastor"
                class="w-full h-full object-cover cursor-pointer"
                (click)="openLightbox(jefe)"
              />
            } @else {
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          </div>
          <div class="relative">
            <app-badge color="amber">{{ cargoNombre(jefe.cargoId) }}</app-badge>
            <h2 class="text-white text-xl font-semibold mt-1.5">{{ jefe.nombrePastor }}</h2>
            <p class="text-white/50 text-sm mt-0.5">Autoridad regional de la IDDP Norte Chico</p>
          </div>
        </div>
      }

      <!-- Obispos distritales: agrupados, con badge de distrito -->
      @if (obisposDistritales().length > 0) {
        <h2 class="text-lg font-semibold text-foreground mb-4">Obispos Distritales</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (pastor of obisposDistritales(); track pastor.id) {
            <div class="bg-surface border border-border rounded-lg p-5">
              <div class="flex items-start justify-between gap-2 mb-3">
                <div
                  class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden"
                >
                  @if (pastor.foto) {
                    <img
                      [src]="pastor.foto"
                      [alt]="pastor.nombrePastor"
                      class="w-full h-full object-cover cursor-pointer"
                      (click)="openLightbox(pastor)"
                    />
                  } @else {
                    <svg
                      class="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                </div>
                @if (pastor.distritoId) {
                  <app-badge color="teal">{{ distritoNombre(pastor.distritoId) }}</app-badge>
                }
              </div>
              <h3 class="font-semibold text-foreground text-sm leading-snug">
                {{ pastor.nombrePastor }}
              </h3>
              <p class="text-xs text-muted mt-0.5">{{ cargoNombre(pastor.cargoId) }}</p>
            </div>
          }
        </div>
      }
    </div>

    <app-image-lightbox [image]="lightboxImage()" (closed)="lightboxImage.set(null)" />
  `,
})
export class DirectivaComponent {
  private readonly pastoresService = inject(PastoresService);
  private readonly cargosService = inject(CargosService);
  private readonly distritosService = inject(DistritosService);

  pastores = toSignal(this.pastoresService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  cargos = toSignal(this.cargosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  distritos = toSignal(this.distritosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });

  obispoRegional = computed<Pastor | undefined>(() =>
    this.pastores().find((p) => this.cargoNombre(p.cargoId) === 'Obispo Regional'),
  );

  obisposDistritales = computed<Pastor[]>(() =>
    this.pastores().filter((p) => this.cargoNombre(p.cargoId) === 'Obispo Distrital'),
  );

  cargoNombre(id: number): string {
    return this.cargos().find((c) => c.id === id)?.nombre ?? '';
  }

  distritoNombre(id: number): string {
    return this.distritos().find((d) => d.id === id)?.nombre ?? '';
  }

  lightboxImage = signal<LightboxImage | null>(null);

  openLightbox(pastor: Pastor): void {
    if (!pastor.foto) return;
    this.lightboxImage.set({
      src: pastor.foto,
      alt: pastor.nombrePastor,
      caption: pastor.nombrePastor,
    });
  }
}
