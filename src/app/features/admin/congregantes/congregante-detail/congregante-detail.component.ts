import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CongregantesService } from '../../../../core/services/congregantes.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { Congregante } from '../../../../core/models';

@Component({
  selector: 'app-congregante-detail',
  standalone: true,
  imports: [RouterLink, ButtonComponent, BadgeComponent],
  template: `
    @if (congregante(); as c) {
      <div>
        <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <a routerLink="/admin/congregantes" class="text-sm text-muted hover:text-primary transition-colors">← Volver</a>
            <h1 class="font-display text-2xl text-foreground mt-2">
              {{ c.nombre }} {{ c.apellido }}
            </h1>
            <app-badge [color]="c.estadoEclesialId === 1 ? 'green' : 'gray'">
              {{ estadoEclesial(c.estadoEclesialId) }}
            </app-badge>
          </div>
          <a [routerLink]="['/admin/congregantes', c.id, 'editar']">
            <app-button variant="ghost">Editar</app-button>
          </a>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h2 class="font-semibold text-foreground text-sm">Datos personales</h2>
            <dl class="space-y-2 text-sm">
              <div><dt class="text-muted">DNI</dt><dd class="text-foreground font-mono">{{ c.dni }}</dd></div>
              <div><dt class="text-muted">Sexo</dt><dd class="text-foreground">{{ sexo(c.sexoId) }}</dd></div>
              <div><dt class="text-muted">Estado civil</dt><dd class="text-foreground">{{ estadoCivil(c.estadoCivilId) }}</dd></div>
              <div><dt class="text-muted">Teléfono</dt><dd class="text-foreground">{{ c.telefono ?? '—' }}</dd></div>
              <div><dt class="text-muted">Correo</dt><dd class="text-foreground">{{ c.correo ?? '—' }}</dd></div>
            </dl>
          </div>

          <div class="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h2 class="font-semibold text-foreground text-sm">Datos eclesiales</h2>
            <dl class="space-y-2 text-sm">
              <div><dt class="text-muted">Iglesia</dt><dd class="text-foreground">{{ iglesiaName(c.iglesiaId) }}</dd></div>
              <div><dt class="text-muted">Conversión</dt><dd class="text-foreground">{{ c.fechaConversion ?? '—' }}</dd></div>
              <div><dt class="text-muted">Bautismo</dt><dd class="text-foreground">{{ c.fechaBautismo ?? '—' }}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    } @else if (cargando()) {
      <div class="py-20 text-center text-muted">Cargando…</div>
    } @else {
      <div class="py-20 text-center"><p class="text-muted">Congregante no encontrado.</p></div>
    }
  `,
})
export class CongregantesDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CongregantesService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  congregante = signal<Congregante | null>(null);
  cargando = signal(true);
  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  sexos = toSignal(this.catalogosService.getSexos(), { initialValue: [] });
  estadosCiviles = toSignal(this.catalogosService.getEstadosCiviles(), { initialValue: [] });
  estadosEclesiales = toSignal(this.catalogosService.getEstadosEclesiales(), { initialValue: [] });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.service.getById(Number(id)).subscribe(c => {
        this.congregante.set(c ?? null);
        this.cargando.set(false);
        this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Congregantes', route: '/admin/congregantes' }, { label: `${c?.nombre ?? ''} ${c?.apellido ?? ''}`.trim() }]);
      });
    }
  }

  iglesiaName(id: number): string { return this.iglesias().find(i => i.id === id)?.nombre ?? '—'; }
  sexo(id: number): string { return this.sexos().find(s => s.id === id)?.nombre ?? '—'; }
  estadoCivil(id: number): string { return this.estadosCiviles().find(e => e.id === id)?.nombre ?? '—'; }
  estadoEclesial(id: number): string { return this.estadosEclesiales().find(e => e.id === id)?.nombre ?? '—'; }
}
