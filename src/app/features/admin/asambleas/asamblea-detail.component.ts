import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ROLES } from '../../../core/utils/permisos.util';
import { AsambleasService } from '../../../core/services/asambleas.service';
import { guardarArchivo } from '../../../core/services/reportes.service';
import { TiempoRealService } from '../../../core/services/tiempo-real.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';
import { AsambleaDetalle, CandidatoAdmin, Conteo, EleccionAdmin } from '../../../core/models';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FotoCandidatoComponent } from '../../../shared/ui/foto-candidato/foto-candidato.component';
import { ImageUploadComponent } from '../../../shared/ui/image-upload/image-upload.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { QrAccesoComponent } from '../../../shared/ui/qr-acceso/qr-acceso.component';
import { AcreditacionComponent } from './acreditacion.component';
import { BADGE_ASAMBLEA, BADGE_ELECCION, formatearFecha, formatearHora } from './estado-badge';

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
            <app-button variant="ghost" (clicked)="descargar('acta.pdf')">Acta (PDF)</app-button>
            <app-button variant="ghost" (clicked)="descargar('metricas.csv')"
              >Métricas (CSV)</app-button
            >
            @if (esResponsable()) {
              <app-button variant="ghost" (clicked)="eliminarAsamblea()">Eliminar</app-button>
            }
            @if (a.estado === 'EN_CURSO') {
              <app-button variant="danger" (clicked)="finalizar()">Finalizar asamblea</app-button>
            }
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

              @if (e.estado !== 'PENDIENTE' && conteo(); as k) {
                <!-- Conteo en vivo (prototipo, Figura 17): solo lo ve el panel -->
                @if (e.estado === 'ABIERTA') {
                  <p
                    class="flex items-center gap-2 text-danger font-semibold text-sm -mt-2 mb-3"
                    aria-live="polite"
                  >
                    <span class="w-2.5 h-2.5 rounded-full bg-danger animate-pulse"></span> EN VIVO
                    @if (!conectado()) {
                      <span class="text-muted font-normal">· reconectando…</span>
                    }
                  </p>
                }
                <div class="grid grid-cols-3 gap-3">
                  <div class="border border-border rounded-lg p-4">
                    <p class="text-3xl font-semibold text-foreground">{{ k.acreditados }}</p>
                    <p class="text-sm text-muted">Electores acreditados</p>
                  </div>
                  <div class="border border-border rounded-lg p-4">
                    <p class="text-3xl font-semibold text-foreground" data-testid="votos-emitidos">
                      {{ k.emisiones }}
                    </p>
                    <p class="text-sm text-muted">Votos emitidos</p>
                  </div>
                  <div class="border border-border rounded-lg p-4">
                    <p class="text-3xl font-semibold text-foreground">
                      {{ k.acreditados - k.emisiones }}
                    </p>
                    <p class="text-sm text-muted">Faltan votar</p>
                  </div>
                </div>
                <div class="h-2.5 rounded-full bg-border mt-4 overflow-hidden" aria-hidden="true">
                  <div class="h-full bg-secondary" [style.width.%]="participacion()"></div>
                </div>
                <p class="text-sm text-muted mt-1">
                  Participación: {{ participacion() }} % de los electores acreditados
                </p>
                <ul class="divide-y divide-border mt-3">
                  @for (c of k.candidatos; track c.id) {
                    <li class="flex items-center gap-4 py-3">
                      <app-foto-candidato
                        [candidatoId]="c.id"
                        [nombre]="c.nombre"
                        [tamano]="52"
                        [version]="version()"
                      />
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-foreground">
                          {{ c.nombre }}
                          @if (c.id === k.ganadorId) {
                            <span class="ml-1 text-success text-sm">· Ganador</span>
                          }
                        </p>
                        <div class="h-2 rounded-full bg-border mt-2 overflow-hidden">
                          <div class="h-full bg-primary" [style.width.%]="c.porcentaje"></div>
                        </div>
                      </div>
                      <div class="text-right w-20">
                        <p class="text-2xl font-semibold text-foreground">{{ c.votos }}</p>
                        <p class="text-sm text-muted">{{ c.porcentaje }} %</p>
                      </div>
                    </li>
                  }
                </ul>

                @if (e.estado === 'ABIERTA') {
                  <div class="flex flex-wrap items-center justify-between gap-3 mt-4">
                    <p class="text-sm text-muted">
                      El conteo solo es visible para el administrador.
                    </p>
                    <app-button variant="danger" (clicked)="cerrar(e)">Cerrar votación</app-button>
                  </div>
                } @else if (k.ganadorId) {
                  <div
                    class="flex flex-wrap items-center justify-between gap-3 mt-4 p-4 rounded-lg bg-success/10 border border-success/30"
                  >
                    <p class="text-foreground">
                      Resultado: <strong>{{ nombreGanador() }}</strong>
                      @if (e.publicadaEn) {
                        <span class="text-muted text-sm">
                          · proyectado a las {{ hora(e.publicadaEn) }}</span
                        >
                      }
                    </p>
                    @if (!e.publicadaEn) {
                      <app-button (clicked)="publicar(e)">Proyectar ganador</app-button>
                    }
                  </div>
                } @else {
                  <div
                    class="flex flex-wrap items-center justify-between gap-3 mt-4 p-4 rounded-lg bg-secondary/10 border border-secondary/30"
                  >
                    <p class="text-foreground">
                      <strong>Empate</strong> entre {{ nombresEmpatados() }}.
                    </p>
                    @if (!tieneSegundaVuelta(e)) {
                      <app-button (clicked)="segundaVuelta(e)">Convocar segunda vuelta</app-button>
                    }
                  </div>
                }
              } @else {
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
              }

              @if (e.estado === 'PENDIENTE') {
                <div class="flex flex-wrap gap-2 mt-4">
                  <app-button
                    (clicked)="abrir(e)"
                    [disabled]="e.candidatos.length === 0 || hayAbierta()"
                    >Abrir votación</app-button
                  >
                  <app-button variant="ghost" (clicked)="nuevoCandidato(e)"
                    >+ Agregar candidato</app-button
                  >
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
export class AsambleaDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AsambleasService);
  private readonly breadcrumb = inject(BreadcrumbService);
  private readonly fb = inject(FormBuilder);
  private readonly tiempoReal = inject(TiempoRealService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly esResponsable = computed(() => this.auth.currentUser()?.rol === ROLES.RESPONSABLE);
  private suscripcion?: Subscription;

  readonly badgeAsamblea = BADGE_ASAMBLEA;
  readonly badgeEleccion = BADGE_ELECCION;
  readonly fecha = formatearFecha;
  readonly hora = formatearHora;

  /** Conteo de la elección seleccionada (abierta o cerrada). Lo actualiza Socket.IO. */
  conteo = signal<Conteo | null>(null);
  conectado = signal(true);

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

  readonly participacion = computed(() => {
    const k = this.conteo();
    return k && k.acreditados ? Math.round((k.emisiones / k.acreditados) * 100) : 0;
  });

  readonly nombreGanador = computed(() => {
    const k = this.conteo();
    return k?.candidatos.find((c) => c.id === k.ganadorId)?.nombre ?? '';
  });

  readonly nombresEmpatados = computed(() => {
    const k = this.conteo();
    return (k?.candidatos ?? [])
      .filter((c) => k!.empatados.includes(c.id))
      .map((c) => c.nombre)
      .join(' y ');
  });

  readonly hayAbierta = computed(
    () => this.asamblea()?.elecciones.some((e) => e.estado === 'ABIERTA') ?? false,
  );

  /** Al cambiar de elección seleccionada (o de estado), se pide su conteo. */
  private readonly cargarConteo = effect(() => {
    const e = this.seleccionada();
    if (!e || e.estado === 'PENDIENTE') {
      this.conteo.set(null);
      return;
    }
    this.service.conteo(e.id).subscribe((k) => this.conteo.set(k));
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
    // Sala admin:{id}: conteo en vivo y avisos de que otra pestaña (u otra mesa) cambió algo.
    this.suscripcion = this.tiempoReal.panel(this.id).subscribe((ev) => {
      if (ev.tipo === 'conteo' && ev.conteo.eleccionId === this.seleccionada()?.id)
        this.conteo.set(ev.conteo);
      if (ev.tipo === 'cambio') this.cargar();
      if (ev.tipo === 'conexion') this.conectado.set(ev.conectado);
      if (ev.tipo === 'error') this.error.set(`Conteo en vivo no disponible: ${ev.error}`);
    });
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  tieneSegundaVuelta(e: EleccionAdmin): boolean {
    return (
      this.asamblea()?.elecciones.some((x) => x.cargo === e.cargo && x.ronda === e.ronda + 1) ??
      false
    );
  }

  abrir(e: EleccionAdmin): void {
    if (
      confirm(`¿Abrir la votación de "${e.cargo}"? Los electores verán la cédula en sus celulares.`)
    ) {
      this.ejecutar(this.service.abrir(e.id), (k) => this.conteo.set(k));
    }
  }

  cerrar(e: EleccionAdmin): void {
    if (confirm(`¿Cerrar la votación de "${e.cargo}"? Ya no se aceptarán más votos.`)) {
      this.ejecutar(this.service.cerrar(e.id), (k) => this.conteo.set(k));
    }
  }

  publicar(e: EleccionAdmin): void {
    this.ejecutar(this.service.publicar(e.id));
  }

  segundaVuelta(e: EleccionAdmin): void {
    if (confirm('¿Convocar una segunda vuelta solo con los candidatos empatados?')) {
      this.ejecutar(this.service.segundaVuelta(e.id), (r) => this.seleccionadaId.set(r.id));
    }
  }

  finalizar(): void {
    if (confirm('¿Finalizar la asamblea? Ya no se podrán abrir más votaciones.')) {
      this.ejecutar(this.service.finalizar(this.id));
    }
  }

  /**
   * Una asamblea con votos es un acta: el backend solo la borra forzando, y solo al Responsable.
   * Se pide confirmación escribiendo el código, para que no se borre por un clic distraído.
   */
  eliminarAsamblea(): void {
    const a = this.asamblea();
    if (!a) return;
    const conVotos = a.elecciones.some((e) => e.emisiones > 0);
    const aviso = conVotos
      ? `Esta asamblea TIENE VOTOS. Se borrarán definitivamente con sus resultados.\nEscribe el código ${a.codigoAcceso} para confirmar:`
      : `Escribe el código ${a.codigoAcceso} para eliminar la asamblea:`;
    if (prompt(aviso)?.trim().toUpperCase() !== a.codigoAcceso) return;
    this.service.delete(a.id, conVotos).subscribe({
      next: () => void this.router.navigate(['/admin/asambleas']),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }

  descargar(archivo: 'acta.pdf' | 'metricas.csv'): void {
    this.error.set('');
    this.service.descargar(this.id, archivo).subscribe({
      next: (a) => guardarArchivo(a),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
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
