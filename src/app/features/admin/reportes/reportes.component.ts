import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IglesiasService } from '../../../core/services/iglesias.service';
import { DistritosService } from '../../../core/services/distritos.service';
import { MinisteriosService } from '../../../core/services/ministerios.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import {
  FormatoReporte,
  ReportesService,
  guardarArchivo,
} from '../../../core/services/reportes.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';
import { ETIQUETAS_GRUPO_ETARIO, ORDEN_GRUPO_ETARIO } from '../../../core/utils/edad.util';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { AvisoAlcanceComponent } from '../../../shared/ui/aviso-alcance/aviso-alcance.component';
import { AuthService } from '../../../core/services/auth.service';
import {
  Agrupacion,
  CongregantesFiltros,
  GrupoEtario,
  ReporteMembresia,
} from '../../../core/models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    SelectComponent,
    InputComponent,
    AvisoAlcanceComponent,
  ],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="font-display text-2xl text-foreground">Reportes de membresía</h1>
        <p class="text-muted text-sm mt-0.5">
          Composición de la membresía por iglesia y por distrito, y descarga de la lista de miembros
          en Excel o PDF.
        </p>
      </div>

      <app-aviso-alcance />

      <!-- Filtros -->
      <div class="bg-surface border border-border rounded-xl p-6 mb-5">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Filtros</h2>
        <form [formGroup]="filtros" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- El obispo distrital no elige distrito: el backend ya fija el suyo (y elegir otro
               respondería 403). -->
          @if (!distritoFijo()) {
            <app-select
              label="Distrito"
              [control]="filtros.controls.distritoId"
              [options]="distritoOptions()"
              placeholder="Todos los distritos"
            />
          }
          <app-select
            label="Iglesia"
            [control]="filtros.controls.iglesiaId"
            [options]="iglesiaOptions()"
            placeholder="Todas las iglesias"
          />
          <app-select
            label="Ministerio"
            [control]="filtros.controls.ministerioId"
            [options]="ministerioOptions()"
            placeholder="Todos los ministerios"
          />
          <app-select
            label="Sexo"
            [control]="filtros.controls.sexoId"
            [options]="sexoOptions()"
            placeholder="Ambos"
          />
          <app-select
            label="Grupo etario"
            [control]="filtros.controls.grupoEtario"
            [options]="grupoEtarioOptions"
            placeholder="Todas las edades"
          />
          <app-select
            label="Estado eclesial"
            [control]="filtros.controls.estadoEclesialId"
            [options]="estadoEclesialOptions()"
            placeholder="Todos"
          />
          <div class="md:col-span-2">
            <app-input
              label="Buscar por nombre, apellido o DNI"
              [control]="filtros.controls.q"
              placeholder="Ej. Quispe"
            />
          </div>
          <div class="flex items-end gap-2">
            <app-button (clicked)="cargar()" [disabled]="cargando()">
              {{ cargando() ? 'Aplicando…' : 'Aplicar filtros' }}
            </app-button>
            <app-button variant="ghost" (clicked)="limpiar()">Limpiar</app-button>
          </div>
        </form>
      </div>

      @if (error(); as mensaje) {
        <div
          class="px-3 py-2.5 mb-5 rounded bg-danger/10 border border-danger/20 text-danger text-sm"
        >
          {{ mensaje }}
        </div>
      }

      @if (reporte(); as r) {
        <!-- Totales: los conteos que el jefe pide de un vistazo -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
          <div class="bg-primary text-white rounded-xl p-4">
            <p class="text-2xl font-semibold leading-none">{{ r.totales.total }}</p>
            <p class="text-xs mt-1.5 opacity-80">Total</p>
          </div>
          @for (sexo of r.columnasSexo; track sexo) {
            <div class="bg-surface border border-border rounded-xl p-4">
              <p class="text-2xl font-semibold leading-none text-foreground">
                {{ r.totales.porSexo[sexo] ?? 0 }}
              </p>
              <p class="text-xs mt-1.5 text-muted">{{ sexo }}</p>
            </div>
          }
          @for (grupo of ordenGrupos; track grupo) {
            <div class="bg-surface border border-border rounded-xl p-4">
              <p class="text-2xl font-semibold leading-none text-foreground">
                {{ r.totales.porGrupoEtario[grupo] ?? 0 }}
              </p>
              <p class="text-xs mt-1.5 text-muted">{{ etiquetas[grupo] }}</p>
            </div>
          }
        </div>

        <!-- Descargas -->
        <div
          class="bg-surface border border-border rounded-xl p-5 mb-5 flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Consolidado por {{ r.agruparPor }}:</span>
            <app-button
              size="sm"
              variant="ghost"
              [disabled]="descargando() !== ''"
              (clicked)="descargarConsolidado('xlsx')"
            >
              {{ descargando() === 'consolidado-xlsx' ? 'Generando…' : 'Excel' }}
            </app-button>
            <app-button
              size="sm"
              variant="ghost"
              [disabled]="descargando() !== ''"
              (clicked)="descargarConsolidado('pdf')"
            >
              {{ descargando() === 'consolidado-pdf' ? 'Generando…' : 'PDF' }}
            </app-button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">Lista de miembros ({{ r.totales.total }}):</span>
            <app-button
              size="sm"
              [disabled]="descargando() !== ''"
              (clicked)="descargarNominal('xlsx')"
            >
              {{ descargando() === 'nominal-xlsx' ? 'Generando…' : 'Excel' }}
            </app-button>
            <app-button
              size="sm"
              [disabled]="descargando() !== ''"
              (clicked)="descargarNominal('pdf')"
            >
              {{ descargando() === 'nominal-pdf' ? 'Generando…' : 'PDF' }}
            </app-button>
          </div>
        </div>

        <!-- Consolidado -->
        <div class="bg-surface border border-border rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 class="text-sm font-semibold text-foreground">
              Membresía por {{ r.agruparPor === 'distrito' ? 'distrito' : 'iglesia' }}
            </h2>
            <div class="flex rounded border border-border overflow-hidden text-xs">
              @for (opcion of agrupaciones; track opcion.valor) {
                <button
                  type="button"
                  (click)="cambiarAgrupacion(opcion.valor)"
                  class="px-3 py-1.5 transition-colors"
                  [class.bg-primary]="r.agruparPor === opcion.valor"
                  [class.text-white]="r.agruparPor === opcion.valor"
                  [class.text-muted]="r.agruparPor !== opcion.valor"
                >
                  {{ opcion.etiqueta }}
                </button>
              }
            </div>
          </div>

          <!-- La tabla es ancha: se desplaza dentro de su contenedor, sin arrastrar la página. -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-border/40">
                <tr>
                  <th class="text-left font-medium text-muted px-4 py-2.5">
                    {{ r.agruparPor === 'distrito' ? 'Distrito' : 'Iglesia' }}
                  </th>
                  @if (r.agruparPor === 'iglesia') {
                    <th class="text-left font-medium text-muted px-4 py-2.5">Distrito</th>
                  }
                  <th class="text-center font-medium text-muted px-3 py-2.5">Total</th>
                  @for (sexo of r.columnasSexo; track sexo) {
                    <th class="text-center font-medium text-muted px-3 py-2.5">{{ sexo }}</th>
                  }
                  @for (grupo of ordenGrupos; track grupo) {
                    <th class="text-center font-medium text-muted px-3 py-2.5 whitespace-nowrap">
                      {{ etiquetas[grupo] }}
                    </th>
                  }
                  @for (estado of r.columnasEstadoEclesial; track estado) {
                    <th class="text-center font-medium text-muted px-3 py-2.5">{{ estado }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (fila of r.filas; track fila.id) {
                  <tr class="border-t border-border" [class.opacity-50]="fila.total === 0">
                    <td class="px-4 py-2.5 text-foreground">{{ fila.nombre }}</td>
                    @if (r.agruparPor === 'iglesia') {
                      <td class="px-4 py-2.5 text-muted">{{ fila.distrito }}</td>
                    }
                    <td class="px-3 py-2.5 text-center font-medium text-foreground">
                      {{ fila.total }}
                    </td>
                    @for (sexo of r.columnasSexo; track sexo) {
                      <td class="px-3 py-2.5 text-center text-muted">
                        {{ fila.porSexo[sexo] ?? 0 }}
                      </td>
                    }
                    @for (grupo of ordenGrupos; track grupo) {
                      <td class="px-3 py-2.5 text-center text-muted">
                        {{ fila.porGrupoEtario[grupo] ?? 0 }}
                      </td>
                    }
                    @for (estado of r.columnasEstadoEclesial; track estado) {
                      <td class="px-3 py-2.5 text-center text-muted">
                        {{ fila.porEstadoEclesial[estado] ?? 0 }}
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="12" class="px-4 py-10 text-center text-muted text-sm">
                      Ninguna iglesia tiene miembros que cumplan estos filtros.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else if (!cargando()) {
        <div class="bg-surface border border-border rounded-xl px-4 py-16 text-center">
          <p class="text-muted text-sm">Sin datos para mostrar.</p>
        </div>
      }
    </div>
  `,
})
export class ReportesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReportesService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly distritosService = inject(DistritosService);
  private readonly ministeriosService = inject(MinisteriosService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly breadcrumb = inject(BreadcrumbService);
  readonly distritoFijo = inject(AuthService).distritoAlcance;

  readonly etiquetas = ETIQUETAS_GRUPO_ETARIO;
  readonly ordenGrupos = ORDEN_GRUPO_ETARIO;
  readonly agrupaciones: { valor: Agrupacion; etiqueta: string }[] = [
    { valor: 'iglesia', etiqueta: 'Por iglesia' },
    { valor: 'distrito', etiqueta: 'Por distrito' },
  ];
  readonly grupoEtarioOptions = ORDEN_GRUPO_ETARIO.map((clave) => ({
    value: clave,
    label: ETIQUETAS_GRUPO_ETARIO[clave],
  }));

  reporte = signal<ReporteMembresia | null>(null);
  cargando = signal(false);
  /** Identificador de la descarga en curso, para deshabilitar solo los botones mientras dura. */
  descargando = signal('');
  error = signal('');
  agruparPor = signal<Agrupacion>('iglesia');

  distritos = toSignal(this.distritosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  iglesias = toSignal(
    this.iglesiasService.getAll({ limit: 100, panel: true }).pipe(map((r) => r.data)),
    {
      initialValue: [],
    },
  );
  ministerios = toSignal(this.ministeriosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  sexos = toSignal(this.catalogosService.getSexos(), { initialValue: [] });
  estadosEclesiales = toSignal(this.catalogosService.getEstadosEclesiales(), { initialValue: [] });

  filtros = this.fb.nonNullable.group({
    distritoId: [''],
    iglesiaId: [''],
    ministerioId: [''],
    sexoId: [''],
    estadoEclesialId: [''],
    grupoEtario: [''],
    q: [''],
  });

  distritoOptions = computed(() => this.distritos().map((d) => ({ value: d.id, label: d.nombre })));
  ministerioOptions = computed(() =>
    this.ministerios().map((m) => ({ value: m.id, label: m.nombre })),
  );
  sexoOptions = computed(() => this.sexos().map((s) => ({ value: s.id, label: s.nombre })));
  estadoEclesialOptions = computed(() =>
    this.estadosEclesiales().map((e) => ({ value: e.id, label: e.nombre })),
  );

  /** Al elegir un distrito, la lista de iglesias se acota a las suyas: son 48 en total. */
  iglesiaOptions = computed(() => {
    const distritoId = Number(this.distritoSeleccionado());
    const iglesias = distritoId
      ? this.iglesias().filter((i) => i.distritoId === distritoId)
      : this.iglesias();
    return iglesias.map((i) => ({ value: i.id, label: i.nombre }));
  });

  private readonly distritoSeleccionado = toSignal(this.filtros.controls.distritoId.valueChanges, {
    initialValue: '',
  });

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Reportes' }]);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.getMembresia(this.valoresFiltros(), this.agruparPor()).subscribe({
      next: (r) => {
        this.reporte.set(r);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(extractErrorMessage(err));
      },
    });
  }

  cambiarAgrupacion(valor: Agrupacion): void {
    if (this.agruparPor() === valor) return;
    this.agruparPor.set(valor);
    this.cargar();
  }

  limpiar(): void {
    this.filtros.reset();
    this.cargar();
  }

  descargarConsolidado(formato: FormatoReporte): void {
    this.ejecutarDescarga(
      `consolidado-${formato}`,
      this.service.descargarMembresia(this.valoresFiltros(), this.agruparPor(), formato),
    );
  }

  descargarNominal(formato: FormatoReporte): void {
    this.ejecutarDescarga(
      `nominal-${formato}`,
      this.service.descargarMiembros(this.valoresFiltros(), formato),
    );
  }

  /**
   * Un error de descarga llega como blob (el `responseType` de la petición), así que el mensaje
   * JSON del backend hay que leerlo del cuerpo antes de mostrarlo; si no, el administrador vería
   * "[object Blob]" en lugar de la explicación.
   */
  private ejecutarDescarga(
    id: string,
    peticion: ReturnType<ReportesService['descargarMiembros']>,
  ): void {
    this.descargando.set(id);
    this.error.set('');
    peticion.subscribe({
      next: (archivo) => {
        guardarArchivo(archivo);
        this.descargando.set('');
      },
      error: async (err: { error?: unknown }) => {
        this.descargando.set('');
        this.error.set(await mensajeDeErrorBlob(err));
      },
    });
  }

  /** Los `''` de los selects sin elegir se descartan; el resto se convierte al tipo del filtro. */
  private valoresFiltros(): CongregantesFiltros {
    const v = this.filtros.getRawValue();
    return {
      distritoId: numeroOpcional(v.distritoId),
      iglesiaId: numeroOpcional(v.iglesiaId),
      ministerioId: numeroOpcional(v.ministerioId),
      sexoId: numeroOpcional(v.sexoId),
      estadoEclesialId: numeroOpcional(v.estadoEclesialId),
      grupoEtario: (v.grupoEtario || undefined) as GrupoEtario | undefined,
      q: v.q.trim() || undefined,
    };
  }
}

function numeroOpcional(valor: string): number | undefined {
  return valor ? Number(valor) : undefined;
}

async function mensajeDeErrorBlob(err: { error?: unknown }): Promise<string> {
  if (!(err.error instanceof Blob)) return extractErrorMessage(err);
  try {
    const cuerpo = JSON.parse(await err.error.text()) as { error?: { message?: string } };
    return cuerpo.error?.message ?? 'No se pudo generar el reporte.';
  } catch {
    return 'No se pudo generar el reporte.';
  }
}
