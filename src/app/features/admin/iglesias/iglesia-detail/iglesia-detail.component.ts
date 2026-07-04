import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { DistritosService } from '../../../../core/services/distritos.service';
import { PastoresService } from '../../../../core/services/pastores.service';
import { CargosService } from '../../../../core/services/cargos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { Iglesia } from '../../../../core/models';
import { googleMapsUrl } from '../../../../core/utils/maps.util';

@Component({
  selector: 'app-iglesia-detail',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    @if (iglesia(); as i) {
      <div>
        <div class="flex items-start justify-between mb-6 gap-4">
          <div>
            <a routerLink="/admin/iglesias" class="text-sm text-muted hover:text-primary transition-colors">
              ← Volver a Iglesias
            </a>
            <h1 class="font-display text-2xl text-foreground mt-2">{{ i.nombre }}</h1>
            <p class="text-muted text-sm">{{ distritoNombre(i.distritoId) }}</p>
          </div>
          <a [routerLink]="['/admin/iglesias', i.id, 'editar']">
            <app-button variant="ghost">Editar</app-button>
          </a>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h2 class="font-semibold text-foreground text-sm">Información</h2>
            <div class="text-sm text-muted space-y-2">
              <p><span class="font-medium text-foreground">Dirección:</span> {{ i.direccion }}</p>
              <p><span class="font-medium text-foreground">Distrito:</span> {{ distritoNombre(i.distritoId) }}</p>
              <a [href]="googleMapsUrl(i)" target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center gap-1 text-primary hover:underline">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ver ubicación en Google Maps
              </a>
            </div>
          </div>

          <div class="bg-surface border border-border rounded-xl p-5">
            <h2 class="font-semibold text-foreground text-sm mb-3">Pastor(es)</h2>
            @if (pastoresIglesia().length === 0) {
              <p class="text-sm text-muted">Sin pastores asignados.</p>
            } @else {
              <ul class="space-y-2">
                @for (p of pastoresIglesia(); track p.id) {
                  <li class="text-sm">
                    <p class="text-foreground font-medium">{{ p.nombrePastor }}</p>
                    <p class="text-xs text-muted">{{ cargoNombre(p.cargoId) }}</p>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </div>
    } @else if (cargando()) {
      <div class="py-20 text-center text-muted">Cargando…</div>
    } @else {
      <div class="py-20 text-center">
        <p class="text-muted">Iglesia no encontrada.</p>
        <a routerLink="/admin/iglesias" class="text-primary hover:underline text-sm mt-2 inline-block">← Volver</a>
      </div>
    }
  `,
})
export class IglesiaDetailComponent implements OnInit {
  protected readonly googleMapsUrl = googleMapsUrl;

  private readonly route = inject(ActivatedRoute);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly distritosService = inject(DistritosService);
  private readonly pastoresService = inject(PastoresService);
  private readonly cargosService = inject(CargosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  iglesia = signal<Iglesia | null>(null);
  cargando = signal(true);
  distritos = toSignal(this.distritosService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  pastores = toSignal(this.pastoresService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  cargos = toSignal(this.cargosService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });

  get pastoresIglesia() {
    const id = this.iglesia()?.id;
    return () => this.pastores().filter(p => p.iglesiaId === id);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.iglesiasService.getById(Number(id)).subscribe(i => {
        this.iglesia.set(i ?? null);
        this.cargando.set(false);
        this.breadcrumb.set([
          { label: 'Admin', route: '/admin/dashboard' },
          { label: 'Iglesias', route: '/admin/iglesias' },
          { label: i?.nombre ?? 'Detalle' },
        ]);
      });
    }
  }

  distritoNombre(id: number): string {
    return this.distritos().find(d => d.id === id)?.nombre ?? '—';
  }

  cargoNombre(id: number): string {
    return this.cargos().find(c => c.id === id)?.nombre ?? '—';
  }
}
