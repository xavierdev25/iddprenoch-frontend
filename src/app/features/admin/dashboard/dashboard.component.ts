import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { IglesiasService } from '../../../core/services/iglesias.service';
import { CongregantesService } from '../../../core/services/congregantes.service';
import { EventosService } from '../../../core/services/eventos.service';
import { ComunicadosService } from '../../../core/services/comunicados.service';

interface StatCard {
  label: string;
  value: number;
  route: string;
  icon: string;
  accent: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div>
      <div class="mb-8">
        <h1 class="font-display text-3xl text-foreground">Dashboard</h1>
        <p class="text-muted text-sm mt-1">Resumen del sistema — IDDP Región Norte Chico</p>
      </div>

      <!-- Metric cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        @for (stat of stats(); track stat.label) {
          <a
            [routerLink]="stat.route"
            class="bg-surface border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all block"
          >
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                [class]="stat.accent"
              >
                {{ stat.icon }}
              </div>
              <span class="text-3xl font-display font-semibold text-foreground">{{
                stat.value
              }}</span>
            </div>
            <p class="text-sm font-medium text-foreground">{{ stat.label }}</p>
            <span class="text-xs text-primary font-medium mt-1 inline-block">Ver todos →</span>
          </a>
        }
      </div>

      <!-- Accesos rápidos -->
      <h2 class="text-sm font-semibold uppercase tracking-widest text-muted mb-3">
        Accesos rápidos
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (acceso of accesosRapidos; track acceso.titulo) {
          <a
            [routerLink]="acceso.ruta"
            class="flex items-center gap-4 p-4 bg-surface border border-border rounded-lg hover:border-primary/30 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0"
            >
              {{ acceso.icon }}
            </div>
            <div>
              <p class="font-medium text-foreground text-sm">{{ acceso.titulo }}</p>
              <p class="text-xs text-muted">{{ acceso.descripcion }}</p>
            </div>
            <svg
              class="w-4 h-4 text-muted ml-auto shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly breadcrumb = inject(BreadcrumbService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly congregantesService = inject(CongregantesService);
  private readonly eventosService = inject(EventosService);
  private readonly comunicadosService = inject(ComunicadosService);

  // Solo necesitamos el `total` de cada recurso para las tarjetas de resumen,
  // así que pedimos limit:1 (el payload de `data` no se usa aquí).
  private readonly iglesiasResp = toSignal(this.iglesiasService.getAll({ limit: 1 }), {
    initialValue: null,
  });
  private readonly congregantesResp = toSignal(this.congregantesService.getAll({ limit: 1 }), {
    initialValue: null,
  });
  private readonly comunicadosResp = toSignal(this.comunicadosService.getAll({ limit: 1 }), {
    initialValue: null,
  });
  eventosProximos = toSignal(this.eventosService.getProximos(100), { initialValue: [] });

  stats = computed<StatCard[]>(() => [
    {
      label: 'Congregantes',
      value: this.congregantesResp()?.total ?? 0,
      route: '/admin/congregantes',
      icon: '👥',
      accent: 'bg-primary/10',
    },
    {
      label: 'Iglesias',
      value: this.iglesiasResp()?.total ?? 0,
      route: '/admin/iglesias',
      icon: '⛪',
      accent: 'bg-secondary/10',
    },
    {
      label: 'Eventos próximos',
      value: this.eventosProximos().length,
      route: '/admin/eventos',
      icon: '📅',
      accent: 'bg-blue-500/10',
    },
    {
      label: 'Comunicados',
      value: this.comunicadosResp()?.total ?? 0,
      route: '/admin/comunicados',
      icon: '📢',
      accent: 'bg-success/10',
    },
  ]);

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Dashboard' }]);
  }

  readonly accesosRapidos = [
    {
      icon: '⛪',
      titulo: 'Nueva iglesia',
      descripcion: 'Registrar una congregación',
      ruta: '/admin/iglesias/nuevo',
    },
    {
      icon: '👤',
      titulo: 'Nuevo pastor',
      descripcion: 'Registrar un pastor',
      ruta: '/admin/pastores/nuevo',
    },
    {
      icon: '👥',
      titulo: 'Nuevo congregante',
      descripcion: 'Registrar un miembro',
      ruta: '/admin/congregantes/nuevo',
    },
    {
      icon: '📅',
      titulo: 'Nuevo evento',
      descripcion: 'Publicar un evento',
      ruta: '/admin/eventos/nuevo',
    },
    {
      icon: '📢',
      titulo: 'Nuevo comunicado',
      descripcion: 'Publicar un comunicado',
      ruta: '/admin/comunicados/nuevo',
    },
    {
      icon: '🔐',
      titulo: 'Gestionar usuarios',
      descripcion: 'Permisos del sistema',
      ruta: '/admin/usuarios',
    },
  ];
}
