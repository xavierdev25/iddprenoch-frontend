import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsambleasService } from '../../../core/services/asambleas.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';
import { AsambleaDetalle, CandidatoAdmin, EleccionAdmin } from '../../../core/models';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FotoCandidatoComponent } from '../../../shared/ui/foto-candidato/foto-candidato.component';
import { ImageUploadComponent } from '../../../shared/ui/image-upload/image-upload.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { QrAccesoComponent } from '../../../shared/ui/qr-acceso/qr-acceso.component';
import { AcreditacionComponent } from './acreditacion.component';
import { BADGE_ASAMBLEA, BADGE_ELECCION, formatearFecha } from './estado-badge';

/** Panel de la asamblea (prototipo, Figura 17). */
@Component({
  selector: 'app-asamblea-detail',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    FotoCandidatoComponent,
    ImageUploadComponent,
    InputComponent,
    ModalComponent,
    QrAccesoComponent,
    AcreditacionComponent,
  ],
  template: `
    @if (asamblea(); as a) {
      <div>
        <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-display text-3xl text-foreground">{{ a.nombre }}</h1>
              <app-badge [color]="badgeAsamblea[a.estado].color">{{
                badgeAsamblea[a.estado].texto
              }}</app-badge>
            </div>
            <p class="text-sm text-muted mt-1">
              {{ fecha(a.fecha) }} ·
              {{ a.tipo === 'REGIONAL' ? 'Regional' : 'Distrital — ' + a.distrito }} · Código
              <strong class="tracking-widest text-foreground">{{ a.codigoAcceso }}</strong>
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a [routerLink]="['/proyeccion', a.codigoAcceso]" target="_blank" rel="noopener">
              <app-button variant="ghost">Abrir pantalla de proyección</app-button>
            </a>
            <app-button variant="ghost" (clicked)="modalQr.set(true)"
              >Código QR de ingreso</app-button
            >
          </div>
        </div>

        @if (error()) {
          <div
            class="px-3 py-2.5 mb-4 rounded bg-danger/10 border border-danger/20 text-danger text-sm"
          >
            {{ error() }}
          </div>
        }

        <div class="grid gap-5 lg:grid-cols-[1fr_380px]">
          <!-- Cargo seleccionado -->
          <section class="bg-surface border border-border rounded-xl p-6">
            @if (seleccionada(); as e) {
              <div class="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p class="text-sm text-muted">Elección · Ronda {{ e.ronda }}</p>
                  <h2 class="font-display text-2xl text-foreground">{{ e.cargo }}</h2>
                </div>
                <app-badge [color]="badgeEleccion[e.estado].color">{{
                  badgeEleccion[e.estado].texto
                }}</app-badge>
              </div>

              <ul class="divide-y divide-border">
                @for (c of e.candidatos; track c.id) {
                  <li class="flex items-center gap-4 py-3">
                    <app-foto-candidato
                      [candidatoId]="c.id"
                      [nombre]="c.nombre"
                      [tamano]="56"
                      [version]="version()"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-foreground">{{ c.nombre }}</p>
                      @if (c.detalle) {
                        <p class="text-sm text-muted">{{ c.detalle }}</p>
                      }
                    </div>
                    @if (e.estado === 'PENDIENTE') {
                      <button
                        type="button"
                        class="text-sm text-primary hover:underline"
                        (click)="editarCandidato(e, c)"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        class="text-sm text-danger hover:underline"
                        (click)="eliminarCandidato(c)"
                      >
                        Quitar
                      </button>
                    }
                  </li>
                } @empty {
                  <li class="py-8 text-center text-muted text-sm">
                    Este cargo aún no tiene candidatos.
                  </li>
                }
              </ul>

              @if (e.estado === 'PENDIENTE') {
                <div class="flex flex-wrap gap-2 mt-4">
                  <app-button (clicked)="nuevoCandidato(e)">+ Agregar candidato</app-button>
                  <app-button variant="ghost" (clicked)="renombrarCargo(e)"
                    >Renombrar cargo</app-button
                  >
                  <app-button variant="danger" (clicked)="eliminarCargo(e)"
                    >Eliminar cargo</app-button
                  >
                </div>
              }
            } @else {
              <p class="text-muted text-sm py-10 text-center">
                Agrega el primer cargo a elegir en el panel de la derecha.
              </p>
            }
          </section>

          <div class="space-y-5">
            <!-- Cargos a elegir -->
            <section class="bg-surface border border-border rounded-xl p-6">
              <h2 class="font-semibold text-foreground text-lg mb-3">Cargos a elegir</h2>
              <ul class="divide-y divide-border">
                @for (e of a.elecciones; track e.id) {
                  <li>
                    <button
                      type="button"
                      class="w-full text-left py-3 flex items-center justify-between gap-3 rounded"
                      [class.bg-primary/5]="e.id === seleccionadaId()"
                      (click)="seleccionadaId.set(e.id)"
                    >
                      <span>
                        <span class="block font-semibold text-foreground">
                          {{ e.cargo }}
                          @if (e.ronda > 1) {
                            · ronda {{ e.ronda }}
                          }
                        </span>
                        <span class="block text-sm text-muted">
                          @if (e.ganador) {
                            Ganador: {{ e.ganador }}
                          } @else {
                            {{ e.candidatos.length }} candidatos
                          }
                        </span>
                      </span>
                      <app-badge [color]="badgeEleccion[e.estado].color">{{
                        badgeEleccion[e.estado].texto
                      }}</app-badge>
                    </button>
                  </li>
                }
              </ul>
              @if (a.estado !== 'FINALIZADA') {
                <form class="flex gap-2 mt-3" (ngSubmit)="agregarCargo()">
                  <label class="sr-only" for="nuevo-cargo">Nuevo cargo</label>
                  <input
                    id="nuevo-cargo"
                    name="cargo"
                    [(ngModel)]="nuevoCargo"
                    placeholder="Ej. Tesorero Regional"
                    class="flex-1 px-3 py-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <app-button
                    type="submit"
                    variant="ghost"
                    [disabled]="nuevoCargo.trim().length < 2"
                    >+ Agregar</app-button
                  >
                </form>
              }
            </section>

            <!-- Acreditación -->
            <section class="bg-surface border border-border rounded-xl p-6">
              <h2 class="font-semibold text-foreground text-lg">Acreditación</h2>
              <p class="mt-2">
                <span class="text-4xl font-semibold text-foreground">{{ a.acreditados }}</span>
                <span class="text-muted"> de {{ a.padron }} electores</span>
              </p>
              <div class="h-2.5 rounded-full bg-border mt-3 overflow-hidden" aria-hidden="true">
                <div class="h-full bg-primary" [style.width.%]="porcentajeAcreditados()"></div>
              </div>
              @if (a.estado !== 'FINALIZADA') {
                <div class="mt-4">
                  <app-button (clicked)="modalAcreditar.set(true)">Acreditar elector</app-button>
                </div>
              }
              <a
                [routerLink]="['/admin/asambleas', a.id, 'padron']"
                class="inline-block mt-3 text-sm text-primary hover:underline"
              >
                Ver y cargar el padrón →
              </a>
            </section>
          </div>
        </div>
      </div>

      <app-modal [isOpen]="modalQr()" title="Código QR de ingreso" (closed)="modalQr.set(false)">
        <app-qr-acceso [codigo]="a.codigoAcceso" />
        <div class="flex justify-center mt-4">
          <app-button variant="ghost" (clicked)="imprimir()">Imprimir</app-button>
        </div>
      </app-modal>

      <app-modal
        [isOpen]="modalAcreditar()"
        title="Acreditar elector"
        (closed)="modalAcreditar.set(false)"
      >
        <app-acreditacion [asambleaId]="a.id" (acreditado)="cargar()" />
      </app-modal>

      <app-modal
        [isOpen]="modalCandidato()"
        [title]="candidatoEditando() ? 'Editar candidato' : 'Nuevo candidato'"
        (closed)="modalCandidato.set(false)"
      >
        <form [formGroup]="formCandidato" (ngSubmit)="guardarCandidato()" class="space-y-4">
          <app-input
            label="Nombre completo"
            [control]="formCandidato.controls.nombre"
            [required]="true"
          />
          <app-input
            label="Detalle (opcional)"
            [control]="formCandidato.controls.detalle"
            placeholder="Ej. Distrito Huaura"
          />
          <app-image-upload
            label="Foto (opcional)"
            [control]="formCandidato.controls.foto"
            [maxLado]="480"
          />
          <div class="flex gap-3 justify-end">
            <app-button variant="ghost" (clicked)="modalCandidato.set(false)">Cancelar</app-button>
            <app-button type="submit" [disabled]="formCandidato.invalid">Guardar</app-button>
          </div>
        </form>
      </app-modal>
    }
  `,
})
export class AsambleaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AsambleasService);
  private readonly breadcrumb = inject(BreadcrumbService);
  private readonly fb = inject(FormBuilder);

  readonly badgeAsamblea = BADGE_ASAMBLEA;
  readonly badgeEleccion = BADGE_ELECCION;
  readonly fecha = formatearFecha;

  asamblea = signal<AsambleaDetalle | null>(null);
  seleccionadaId = signal<number | null>(null);
  /**
   * Va en la URL de las fotos: el panel siempre ve la foto vigente aunque el navegador tenga en
   * caché una anterior (se cachean 1 h para los celulares). Cambia al cargar y tras cada edición.
   */
  version = signal(Date.now());
  error = signal('');
  modalQr = signal(false);
  modalAcreditar = signal(false);
  modalCandidato = signal(false);
  candidatoEditando = signal<CandidatoAdmin | null>(null);
  private eleccionCandidato: EleccionAdmin | null = null;
  nuevoCargo = '';

  formCandidato = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    detalle: [''],
    foto: [''],
  });

  readonly seleccionada = computed(() => {
    const a = this.asamblea();
    if (!a) return null;
    return (
      a.elecciones.find((e) => e.id === this.seleccionadaId()) ??
      a.elecciones.find((e) => e.estado === 'ABIERTA') ??
      a.elecciones[0] ??
      null
    );
  });

  readonly porcentajeAcreditados = computed(() => {
    const a = this.asamblea();
    return a && a.padron ? Math.round((a.acreditados / a.padron) * 100) : 0;
  });

  private get id(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getById(this.id).subscribe({
      next: (a) => {
        this.asamblea.set(a);
        this.breadcrumb.set([
          { label: 'Admin', route: '/admin/dashboard' },
          { label: 'Asambleas', route: '/admin/asambleas' },
          { label: a.nombre },
        ]);
      },
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }

  agregarCargo(): void {
    const cargo = this.nuevoCargo.trim();
    this.ejecutar(this.service.crearEleccion(this.id, cargo), (e) => {
      this.nuevoCargo = '';
      this.seleccionadaId.set((e as { id: number }).id);
    });
  }

  renombrarCargo(e: EleccionAdmin): void {
    const cargo = prompt('Nuevo nombre del cargo', e.cargo)?.trim();
    if (cargo && cargo !== e.cargo) this.ejecutar(this.service.actualizarEleccion(e.id, cargo));
  }

  eliminarCargo(e: EleccionAdmin): void {
    if (confirm(`¿Eliminar el cargo "${e.cargo}" y sus candidatos?`)) {
      this.ejecutar(this.service.eliminarEleccion(e.id), () => this.seleccionadaId.set(null));
    }
  }

  nuevoCandidato(e: EleccionAdmin): void {
    this.eleccionCandidato = e;
    this.candidatoEditando.set(null);
    this.formCandidato.reset({ nombre: '', detalle: '', foto: '' });
    this.modalCandidato.set(true);
  }

  editarCandidato(e: EleccionAdmin, c: CandidatoAdmin): void {
    this.eleccionCandidato = e;
    this.candidatoEditando.set(c);
    this.formCandidato.reset({ nombre: c.nombre, detalle: c.detalle ?? '', foto: '' });
    this.modalCandidato.set(true);
  }

  guardarCandidato(): void {
    const v = this.formCandidato.getRawValue();
    const datos = {
      nombre: v.nombre.trim(),
      detalle: v.detalle.trim() || null,
      // En la edición, sin archivo nuevo no se manda la foto: se conserva la guardada.
      ...(this.formCandidato.controls.foto.dirty ? { foto: v.foto || null } : {}),
    };
    const editando = this.candidatoEditando();
    const op = editando
      ? this.service.actualizarCandidato(editando.id, datos)
      : this.service.crearCandidato(this.eleccionCandidato!.id, datos);
    this.ejecutar(op, () => {
      this.modalCandidato.set(false);
      this.version.set(Date.now());
    });
  }

  eliminarCandidato(c: CandidatoAdmin): void {
    if (confirm(`¿Quitar a ${c.nombre} de la cédula?`))
      this.ejecutar(this.service.eliminarCandidato(c.id));
  }

  imprimir(): void {
    window.print();
  }

  /** Ejecuta una acción del panel y recarga la asamblea; los errores se muestran arriba. */
  private ejecutar<T>(op: import('rxjs').Observable<T>, alTerminar?: (r: T) => void): void {
    this.error.set('');
    op.subscribe({
      next: (r) => {
        alTerminar?.(r);
        this.cargar();
      },
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }
}
