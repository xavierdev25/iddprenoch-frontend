import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { VotacionService } from '../../core/services/votacion.service';
import {
  Cedula,
  CandidatoCedula,
  Constancia,
  EstadoElector,
  InfoVotacion,
} from '../../core/models';
import { FotoCandidatoComponent } from '../../shared/ui/foto-candidato/foto-candidato.component';

type Pantalla =
  | 'cargando'
  | 'error'
  | 'ingreso'
  | 'espera'
  | 'cedula'
  | 'confirmar'
  | 'constancia'
  | 'finalizada';

const HORA = new Intl.DateTimeFormat('es-PE', { timeStyle: 'short', timeZone: 'America/Lima' });

/**
 * Vista del elector (prototipo, Figura 16; ADR-028 y ADR-029).
 *
 * Pensada para adultos mayores: textos de 18 px o más, botones de 56 px a todo el ancho, una
 * decisión por pantalla y tres toques para votar (candidato → Continuar → Confirmar). No usa
 * Socket.IO: consulta el estado cada 3 s ± 1 s con ETag (304 si nada cambió).
 */
@Component({
  selector: 'app-votar',
  standalone: true,
  imports: [FormsModule, FotoCandidatoComponent],
  template: `
    <div class="min-h-dvh bg-background text-foreground text-lg flex flex-col">
      <header class="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-bold"
          aria-hidden="true"
        >
          IDDP
        </div>
        <div class="leading-tight">
          <p class="font-semibold text-base">Región Norte Chico</p>
          <p class="text-muted text-base">Votación electrónica</p>
        </div>
      </header>

      <main class="flex-1 w-full max-w-md mx-auto px-5 py-6 flex flex-col" aria-live="polite">
        @switch (pantalla()) {
          @case ('cargando') {
            <p class="text-center text-muted mt-20">Cargando…</p>
          }

          @case ('error') {
            <h1 class="font-display text-3xl mt-8">No pudimos abrir la votación</h1>
            <p class="mt-4">{{ aviso() }}</p>
          }

          @case ('ingreso') {
            <p class="text-muted">{{ info()?.nombre }}</p>
            <h1 class="font-display text-4xl mt-1">Ingresa para votar</h1>
            <form class="mt-6 flex flex-col gap-5" (ngSubmit)="ingresar()">
              <div>
                <label for="dni" class="block font-medium mb-2">Tu DNI</label>
                <input
                  id="dni"
                  name="dni"
                  [(ngModel)]="dni"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="8"
                  class="w-full h-16 px-4 rounded-xl border-2 border-border bg-surface text-3xl tracking-[0.2em] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                />
              </div>
              <div>
                <label for="codigo" class="block font-medium mb-2">Código de 4 dígitos</label>
                <input
                  id="codigo"
                  name="codigo"
                  [(ngModel)]="codigo"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="4"
                  placeholder="••••"
                  class="w-48 h-16 px-4 rounded-xl border-2 border-primary/50 bg-surface text-4xl text-center tracking-[0.5em] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                />
              </div>
              @if (aviso()) {
                <p
                  class="px-4 py-3 rounded-xl bg-danger/10 border-2 border-danger/30 text-danger font-medium"
                  role="alert"
                >
                  {{ aviso() }}
                </p>
              }
              <button type="submit" class="boton-principal" [disabled]="ocupado()">
                {{ ocupado() ? 'Verificando…' : 'Ingresar' }}
              </button>
            </form>
            <p class="mt-6 text-muted">
              ¿No tienes código? Acércate a la mesa de acreditación y te lo entregarán.
            </p>
            <details class="mt-6 text-base text-muted">
              <summary class="cursor-pointer font-medium text-foreground py-2">
                Aviso de privacidad (Ley N.º 29733)
              </summary>
              <p class="mt-2">
                La Iglesia de Dios del Perú – Región Norte Chico usa tu DNI y tu nombre solo para
                comprobar que puedes votar en esta asamblea y que votas una sola vez. Tu voto es
                secreto: se guarda separado de tu identidad y nadie puede saber por quién votaste.
                Puedes ejercer tus derechos de acceso, rectificación y cancelación ante la
                secretaría regional.
              </p>
            </details>
          }

          @case ('espera') {
            <div class="text-center mt-10">
              <div
                class="mx-auto w-20 h-20 rounded-full bg-secondary/15 flex items-center justify-center text-4xl"
                aria-hidden="true"
              >
                ⏳
              </div>
              <h1 class="font-display text-3xl mt-6">{{ aviso() || 'Esperando a la mesa' }}</h1>
              @if (info()?.siguienteCargo; as cargo) {
                <p class="mt-4">
                  Siguiente cargo: <strong>{{ cargo }}</strong>
                </p>
              }
              <p class="mt-4 text-muted">
                No cierres esta página. Se actualizará sola cuando se abra la votación.
              </p>
            </div>
            <button
              type="button"
              class="mt-auto pt-10 text-muted underline text-lg"
              (click)="salir()"
            >
              Salir
            </button>
          }

          @case ('cedula') {
            @if (cedula(); as c) {
              <p
                class="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-primary/10 text-primary font-medium"
              >
                <span class="w-2.5 h-2.5 rounded-full bg-primary" aria-hidden="true"></span>
                Votación abierta
              </p>
              <p class="text-muted mt-4">Elección de</p>
              <h1 class="font-display text-3xl">
                {{ c.cargo }}
                @if (c.ronda > 1) {
                  <span class="text-xl"> · segunda vuelta</span>
                }
              </h1>
              <p class="mt-1">Toca la foto de tu candidato</p>
              <ul
                class="mt-5 flex flex-col gap-3"
                role="radiogroup"
                [attr.aria-label]="'Candidatos a ' + c.cargo"
              >
                @for (cand of c.candidatos; track cand.id) {
                  <li>
                    <button
                      type="button"
                      role="radio"
                      [attr.aria-checked]="elegido()?.id === cand.id"
                      class="w-full min-h-20 flex items-center gap-4 p-3 rounded-2xl border-2 bg-surface text-left focus:outline-none focus:ring-4 focus:ring-primary/30"
                      [class.border-primary]="elegido()?.id === cand.id"
                      [class.bg-primary/5]="elegido()?.id === cand.id"
                      [class.border-border]="elegido()?.id !== cand.id"
                      (click)="elegido.set(cand)"
                    >
                      <app-foto-candidato
                        [candidatoId]="cand.id"
                        [nombre]="cand.nombre"
                        [tieneFoto]="cand.tieneFoto"
                        [tamano]="64"
                      />
                      <span class="flex-1">
                        <span class="block text-xl font-semibold">{{ cand.nombre }}</span>
                        @if (cand.detalle) {
                          <span class="block text-muted">{{ cand.detalle }}</span>
                        }
                      </span>
                      @if (elegido()?.id === cand.id) {
                        <span
                          class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"
                          aria-hidden="true"
                          >✓</span
                        >
                      }
                    </button>
                  </li>
                }
              </ul>
              <div class="sticky bottom-0 bg-background pt-4 pb-2 mt-auto">
                <button
                  type="button"
                  class="boton-principal"
                  [disabled]="!elegido()"
                  (click)="pantalla.set('confirmar')"
                >
                  {{ elegido() ? 'Continuar' : 'Elige un candidato' }}
                </button>
              </div>
            }
          }

          @case ('confirmar') {
            @if (elegido(); as cand) {
              <h1 class="font-display text-3xl text-center mt-4">Confirma tu voto</h1>
              <div class="flex justify-center mt-6">
                <app-foto-candidato
                  [candidatoId]="cand.id"
                  [nombre]="cand.nombre"
                  [tieneFoto]="cand.tieneFoto"
                  [tamano]="140"
                />
              </div>
              <p class="text-2xl font-semibold text-center mt-5">{{ cand.nombre }}</p>
              <p class="text-center mt-1">
                para <strong>{{ cedula()?.cargo }}</strong>
              </p>
              @if (aviso()) {
                <p
                  class="mt-4 px-4 py-3 rounded-xl bg-danger/10 border-2 border-danger/30 text-danger font-medium"
                  role="alert"
                >
                  {{ aviso() }}
                </p>
              }
              <div class="flex flex-col gap-3 mt-8">
                <button
                  type="button"
                  class="boton-principal"
                  [disabled]="ocupado()"
                  (click)="votar()"
                >
                  {{
                    ocupado()
                      ? 'Registrando tu voto…'
                      : aviso()
                        ? 'Reintentar'
                        : 'Sí, confirmar mi voto'
                  }}
                </button>
                <button
                  type="button"
                  class="boton-secundario"
                  [disabled]="ocupado()"
                  (click)="volverACedula()"
                >
                  No, quiero cambiar
                </button>
              </div>
              <p class="text-center text-muted mt-6">
                Tu voto es secreto: nadie podrá saber por quién votaste.
              </p>
            }
          }

          @case ('constancia') {
            <div class="text-center mt-6">
              <div
                class="mx-auto w-28 h-28 rounded-full bg-primary text-white flex items-center justify-center text-6xl ring-8 ring-primary/15"
                aria-hidden="true"
              >
                ✓
              </div>
              <h1 class="font-display text-4xl mt-6">¡Tu voto fue registrado!</h1>
              @if (constancia(); as k) {
                <p class="mt-3">Gracias por participar en la elección de {{ k.cargo }}.</p>
                <p class="mt-4 text-base text-muted">
                  Constancia N.º <strong class="text-foreground">{{ k.numero }}</strong> ·
                  {{ hora(k.emitidoEn) }}
                </p>
              }
            </div>
            <div class="mt-8 bg-surface border border-border rounded-2xl p-5">
              @if (info()?.siguienteCargo; as cargo) {
                <p class="text-muted">Siguiente cargo</p>
                <p class="text-xl font-semibold">{{ cargo }}</p>
              }
              <p
                class="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-secondary/15 text-[#7a5a17] font-medium"
              >
                <span class="w-2.5 h-2.5 rounded-full bg-secondary" aria-hidden="true"></span>
                Esperando a la mesa
              </p>
              <p class="mt-3 text-muted">
                No cierres esta página. Se actualizará sola cuando se abra la votación.
              </p>
            </div>
          }

          @case ('finalizada') {
            <div class="text-center mt-16">
              <h1 class="font-display text-3xl">La asamblea terminó</h1>
              <p class="mt-4">Gracias por participar. Ya puedes cerrar esta página.</p>
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: `
    .boton-principal {
      width: 100%;
      min-height: 56px;
      border-radius: 14px;
      background: var(--color-primary);
      color: #fff;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .boton-principal:disabled {
      opacity: 0.55;
    }
    .boton-secundario {
      width: 100%;
      min-height: 56px;
      border-radius: 14px;
      border: 2px solid var(--color-primary);
      color: var(--color-primary);
      background: #fff;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .boton-principal:focus-visible,
    .boton-secundario:focus-visible {
      outline: 4px solid rgb(15 107 92 / 0.35);
      outline-offset: 2px;
    }
  `,
})
export class VotarComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(VotacionService);
  private readonly title = inject(Title);

  readonly codigoAsamblea = (this.route.snapshot.paramMap.get('codigo') ?? '').toUpperCase();
  readonly hora = (iso: string) => HORA.format(new Date(iso));

  pantalla = signal<Pantalla>('cargando');
  info = signal<InfoVotacion | null>(null);
  cedula = signal<Cedula | null>(null);
  elegido = signal<CandidatoCedula | null>(null);
  constancia = signal<Constancia | null>(null);
  aviso = signal('');
  ocupado = signal(false);
  dni = '';
  codigo = '';

  private etag: string | null = null;
  private version = -1;
  private temporizador: ReturnType<typeof setTimeout> | undefined;
  private activo = true;
  private readonly alCambiarVisibilidad = () => {
    if (document.visibilityState === 'visible' && this.consultando()) this.consultar();
  };

  readonly consultando = computed(
    () => !['cargando', 'error', 'ingreso', 'finalizada'].includes(this.pantalla()),
  );

  ngOnInit(): void {
    this.title.setTitle('Votación — IDDP Región Norte Chico');
    document.addEventListener('visibilitychange', this.alCambiarVisibilidad);
    this.service.info(this.codigoAsamblea).subscribe({
      next: (i) => {
        this.info.set(i);
        if (i.estado === 'FINALIZADA') {
          this.pantalla.set('finalizada');
          return;
        }
        this.verificarSesion();
      },
      error: (err: HttpErrorResponse) => {
        this.aviso.set(
          err.status === 404
            ? 'El código de la asamblea no es válido. Vuelve a escanear el QR.'
            : 'Revisa tu conexión a internet y recarga la página.',
        );
        this.pantalla.set('error');
      },
    });
  }

  ngOnDestroy(): void {
    this.activo = false;
    clearTimeout(this.temporizador);
    document.removeEventListener('visibilitychange', this.alCambiarVisibilidad);
  }

  ingresar(): void {
    this.aviso.set('');
    const dni = this.dni.trim();
    const codigo = this.codigo.trim();
    if (!/^\d{8}$/.test(dni)) return this.aviso.set('Escribe tu DNI: son 8 números.');
    if (!/^\d{4}$/.test(codigo))
      return this.aviso.set('Escribe el código de 4 números que te dio la mesa.');
    this.ocupado.set(true);
    this.service.ingresar(this.codigoAsamblea, dni, codigo).subscribe({
      next: (r) => {
        this.ocupado.set(false);
        this.info.set(r.asamblea);
        this.codigo = '';
        this.etag = null;
        this.pantalla.set('espera');
        this.consultar();
      },
      error: (err: HttpErrorResponse) => {
        this.ocupado.set(false);
        this.aviso.set(this.mensaje(err));
      },
    });
  }

  salir(): void {
    clearTimeout(this.temporizador);
    this.service
      .salir(this.codigoAsamblea)
      .subscribe({ complete: () => this.pantalla.set('ingreso') });
    this.pantalla.set('ingreso');
  }

  volverACedula(): void {
    this.aviso.set('');
    this.pantalla.set('cedula');
  }

  votar(): void {
    const c = this.cedula();
    const cand = this.elegido();
    if (!c || !cand || this.ocupado()) return;
    this.ocupado.set(true);
    this.aviso.set('');
    this.service.votar(this.codigoAsamblea, c.eleccionId, cand.id).subscribe({
      next: (r) => {
        this.ocupado.set(false);
        this.constancia.set(r.constancia);
        this.elegido.set(null);
        this.pantalla.set('constancia');
      },
      error: (err: HttpErrorResponse) => {
        this.ocupado.set(false);
        if (err.status === 409) {
          // Ya votó (otro intento, otra pestaña) o la mesa cerró: no hay nada que reintentar.
          this.elegido.set(null);
          this.aviso.set(this.mensaje(err));
          this.pantalla.set('espera');
        } else if (err.status === 401) {
          this.pantalla.set('ingreso');
          this.aviso.set(this.mensaje(err));
        } else {
          this.aviso.set(
            'No se pudo enviar tu voto (sin conexión). Tu voto aún NO se registró. Toca Reintentar.',
          );
        }
      },
    });
  }

  /**
   * ¿Ya tiene sesión de esta asamblea (recargó la página, volvió a escanear)? Se pregunta el
   * estado antes de mostrar nada, para no hacer parpadear la pantalla de ingreso.
   */
  private verificarSesion(): void {
    this.service.estado(this.codigoAsamblea, null).subscribe({
      next: (res) => {
        this.etag = res.headers.get('ETag');
        this.pantalla.set('espera');
        if (res.body) this.aplicar(res.body);
        this.programar();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.pantalla.set('ingreso');
        } else {
          this.pantalla.set('espera');
          this.programar();
        }
      },
    });
  }

  /** Una consulta del estado, y programa la siguiente en 3 s ± 1 s. */
  private consultar(): void {
    clearTimeout(this.temporizador);
    if (!this.activo || !this.consultando()) return;
    this.service.estado(this.codigoAsamblea, this.etag).subscribe({
      next: (res) => {
        this.etag = res.headers.get('ETag') ?? this.etag;
        if (res.body) this.aplicar(res.body);
        this.programar();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 304) {
          this.programar();
        } else if (err.status === 401) {
          this.pantalla.set('ingreso');
        } else {
          // Sin red o 429: se sigue intentando; el elector no tiene que hacer nada.
          this.programar();
        }
      },
    });
  }

  private programar(): void {
    if (!this.activo || !this.consultando()) return;
    // Pestaña oculta: no se consulta; al volver a verla, `visibilitychange` consulta al instante.
    if (document.visibilityState === 'hidden') return;
    this.temporizador = setTimeout(() => this.consultar(), 2000 + Math.random() * 2000);
  }

  private aplicar(e: EstadoElector): void {
    if (e.version !== this.version) {
      this.version = e.version;
      this.service.info(this.codigoAsamblea).subscribe((i) => this.info.set(i));
    }
    const pantalla = this.pantalla();
    if (e.estado === 'FINALIZADA') {
      this.pantalla.set('finalizada');
      return;
    }
    if (e.estado === 'ABIERTA' && !e.yaVoto) {
      const otraEleccion = this.cedula()?.eleccionId !== e.eleccionId;
      if (pantalla === 'espera' || pantalla === 'constancia' || otraEleccion) this.abrirCedula();
      return;
    }
    if ((pantalla === 'cedula' || pantalla === 'confirmar') && !this.ocupado()) {
      this.elegido.set(null);
      this.aviso.set(
        e.yaVoto ? 'Tu voto ya está registrado' : 'La votación de este cargo se cerró',
      );
      this.pantalla.set('espera');
    }
  }

  private abrirCedula(): void {
    this.service.cedula(this.codigoAsamblea).subscribe({
      next: (c) => {
        if (c.yaVoto) return;
        this.cedula.set(c);
        this.elegido.set(null);
        this.aviso.set('');
        this.pantalla.set('cedula');
      },
      error: () => undefined,
    });
  }

  private mensaje(err: HttpErrorResponse): string {
    const m = (err.error as { error?: { message?: string } } | null)?.error?.message;
    if (m) return m;
    return err.status === 0
      ? 'Sin conexión a internet. Revisa tu señal e inténtalo de nuevo.'
      : 'Algo salió mal. Inténtalo de nuevo.';
  }
}
