import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { DistritosService } from '../../../core/services/distritos.service';

/**
 * Aviso para el obispo distrital de que lo que ve está acotado a su distrito (prototipo, Figura
 * 20). Sin él, una lista corta se confundiría con datos faltantes. Para los roles regionales no
 * muestra nada.
 */
@Component({
  selector: 'app-aviso-alcance',
  standalone: true,
  template: `
    @if (distrito(); as nombre) {
      <div
        class="flex items-start gap-3 px-4 py-3 mb-5 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground"
        role="note"
      >
        <span
          class="shrink-0 w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs font-bold"
          aria-hidden="true"
          >i</span
        >
        <p>
          Estás viendo solo la información de las iglesias del <strong>distrito {{ nombre }}</strong
          >. Tu rol no tiene acceso a la información de otros distritos.
        </p>
      </div>
    }
  `,
})
export class AvisoAlcanceComponent {
  private readonly auth = inject(AuthService);
  private readonly distritos = toSignal(
    inject(DistritosService)
      .getAll({ limit: 100 })
      .pipe(map((r) => r.data)),
    { initialValue: [] },
  );

  /** Nombre del distrito del obispo distrital, o `undefined` si su alcance es la región. */
  readonly distrito = computed(() => {
    const id = this.auth.distritoAlcance();
    return id === null ? undefined : this.distritos().find((d) => d.id === id)?.nombre;
  });
}
