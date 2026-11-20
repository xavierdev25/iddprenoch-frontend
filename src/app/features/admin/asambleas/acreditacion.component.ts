import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsambleasService } from '../../../core/services/asambleas.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';
import { Acreditacion, BusquedaDni } from '../../../core/models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

/**
 * Mesa de acreditación (HU08): DNI → padrón → código de 4 dígitos, que se muestra UNA vez. Pensada
 * para operarse rápido con fila: el DNI queda enfocado, Enter busca y "Siguiente elector" limpia.
 */
@Component({
  selector: 'app-acreditacion',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  template: `
    @if (resultado(); as r) {
      <div class="text-center py-2">
        <p class="text-sm text-muted">
          {{ r.regenerado ? 'Código NUEVO' : 'Código de votación' }} de
        </p>
        <p class="text-lg font-semibold text-foreground">{{ r.elector.nombre }}</p>
        <p
          class="my-5 font-mono text-6xl font-bold tracking-[0.35em] text-primary"
          aria-live="polite"
          data-testid="codigo-elector"
        >
          {{ r.codigo }}
        </p>
        <p
          class="text-sm text-foreground bg-secondary/10 border border-secondary/30 rounded px-3 py-2 mb-5"
        >
          Entrégale este código ahora: <strong>no se volverá a mostrar</strong>. Con su DNI y este
          código ingresa escaneando el QR.
        </p>
        <app-button (clicked)="siguiente()">Siguiente elector</app-button>
      </div>
    } @else {
      <form class="flex gap-2" (ngSubmit)="buscar()">
        <label class="sr-only" for="dni-mesa">DNI del elector</label>
        <input
          #dniInput
          id="dni-mesa"
          name="dni"
          [(ngModel)]="dni"
          inputmode="numeric"
          maxlength="8"
          autocomplete="off"
          placeholder="DNI (8 dígitos)"
          class="flex-1 px-3 py-2.5 rounded border border-border bg-surface text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <app-button type="submit" [disabled]="ocupado()">Buscar</app-button>
      </form>

      @if (busqueda(); as b) {
        <div class="mt-4 border border-border rounded-lg p-4">
          @if (b.enPadron && b.elector) {
            <p class="font-semibold text-foreground">{{ b.elector.nombre }}</p>
            <p class="text-sm text-muted">{{ b.elector.iglesia ?? 'Sin iglesia registrada' }}</p>
            @if (b.elector.acreditado) {
              <p class="text-sm text-foreground mt-3">
                Ya está acreditado. Si perdió su código, genera uno nuevo: el anterior dejará de
                servir.
              </p>
              <div class="mt-3">
                <app-button variant="ghost" (clicked)="acreditar(true)" [disabled]="ocupado()"
                  >Generar código nuevo</app-button
                >
              </div>
            } @else {
              <div class="mt-3">
                <app-button (clicked)="acreditar(false)" [disabled]="ocupado()"
                  >Acreditar y generar código</app-button
                >
              </div>
            }
          } @else {
            <p class="text-sm text-foreground">
              El DNI <strong>{{ dniBuscado() }}</strong> no está en el padrón de esta asamblea.
            </p>
            @if (b.sugerencia; as s) {
              <p class="text-sm text-muted mt-1">
                Figura en la membresía como <strong>{{ s.nombre }}</strong> ({{ s.iglesia }}).
              </p>
            }
            <label class="block text-sm font-medium text-foreground mt-3" for="nombre-mesa"
              >Nombre completo</label
            >
            <input
              id="nombre-mesa"
              name="nombre"
              [(ngModel)]="nombreNuevo"
              class="w-full mt-1 px-3 py-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div class="mt-3">
              <app-button
                (clicked)="agregarYAcreditar()"
                [disabled]="ocupado() || nombreNuevo.trim().length < 3"
              >
                Agregar al padrón y acreditar
              </app-button>
            </div>
          }
        </div>
      }

      @if (error()) {
        <div
          class="mt-3 px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm"
        >
          {{ error() }}
        </div>
      }
    }
  `,
})
export class AcreditacionComponent {
  private readonly service = inject(AsambleasService);
  asambleaId = input.required<number>();
  /** Avisa al panel para que actualice "X de Y acreditados". */
  acreditado = output<void>();

  private readonly dniInput = viewChild<ElementRef<HTMLInputElement>>('dniInput');

  dni = '';
  nombreNuevo = '';
  dniBuscado = signal('');
  busqueda = signal<BusquedaDni | null>(null);
  resultado = signal<Acreditacion | null>(null);
  ocupado = signal(false);
  error = signal('');

  buscar(): void {
    const dni = this.dni.trim();
    this.error.set('');
    this.busqueda.set(null);
    if (!/^\d{8}$/.test(dni)) {
      this.error.set('El DNI tiene 8 dígitos.');
      return;
    }
    this.ocupado.set(true);
    this.service.buscarDni(this.asambleaId(), dni).subscribe({
      next: (b) => {
        this.ocupado.set(false);
        this.dniBuscado.set(dni);
        this.nombreNuevo = b.sugerencia?.nombre ?? '';
        this.busqueda.set(b);
      },
      error: (err) => this.fallar(err),
    });
  }

  acreditar(regenerar: boolean): void {
    if (regenerar && !confirm('¿Generar un código nuevo? El código anterior dejará de funcionar.'))
      return;
    this.ocupado.set(true);
    this.service.acreditar(this.asambleaId(), this.dniBuscado(), regenerar).subscribe({
      next: (r) => {
        this.ocupado.set(false);
        this.resultado.set(r);
        this.acreditado.emit();
      },
      error: (err) => this.fallar(err),
    });
  }

  agregarYAcreditar(): void {
    const sugerencia = this.busqueda()?.sugerencia;
    this.ocupado.set(true);
    this.service
      .agregarElector(this.asambleaId(), {
        dni: this.dniBuscado(),
        nombre: this.nombreNuevo.trim(),
        iglesiaId: sugerencia?.iglesiaId,
      })
      .subscribe({ next: () => this.acreditar(false), error: (err) => this.fallar(err) });
  }

  siguiente(): void {
    this.resultado.set(null);
    this.busqueda.set(null);
    this.dni = '';
    this.nombreNuevo = '';
    this.error.set('');
    setTimeout(() => this.dniInput()?.nativeElement.focus());
  }

  private fallar(err: unknown): void {
    this.ocupado.set(false);
    this.error.set(extractErrorMessage(err));
  }
}
