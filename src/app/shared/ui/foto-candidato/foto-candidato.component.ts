import { Component, computed, input, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

const FONDOS = ['bg-primary', 'bg-secondary', 'bg-[#4b5d78]', 'bg-[#7a4b6b]', 'bg-[#3f6b3a]'];

/**
 * Foto del candidato, o sus iniciales sobre un color si no tiene (prototipo, Figuras 16–18). La
 * imagen viene de /api/candidatos/:id/foto, pública y cacheable: 200 celulares la piden una vez.
 */
@Component({
  selector: 'app-foto-candidato',
  standalone: true,
  template: `
    <div
      class="rounded-full overflow-hidden flex items-center justify-center shrink-0 text-white font-semibold select-none"
      [class]="clases()"
      [style.width.px]="tamano()"
      [style.height.px]="tamano()"
      [style.fontSize.px]="tamano() * 0.36"
      aria-hidden="true"
    >
      @if (mostrarFoto()) {
        <img
          [src]="url()"
          alt=""
          class="w-full h-full object-cover"
          loading="lazy"
          (error)="fallo.set(true)"
        />
      } @else {
        {{ iniciales() }}
      }
    </div>
  `,
})
export class FotoCandidatoComponent {
  candidatoId = input.required<number>();
  nombre = input.required<string>();
  /** `false` evita pedir una foto que se sabe que no existe (la cédula lo informa). */
  tieneFoto = input<boolean>(true);
  tamano = input<number>(56);
  /** Clases extra, p. ej. el aro dorado de la proyección. */
  extra = input<string>('');
  /** Súbelo tras cambiar la foto: la imagen se cachea 1 h y sin esto se vería la anterior. */
  version = input<number>(0);

  readonly fallo = signal(false);
  readonly url = computed(() => {
    const v = this.version();
    return `${environment.apiUrl}/candidatos/${this.candidatoId()}/foto${v ? `?v=${v}` : ''}`;
  });
  readonly mostrarFoto = computed(() => this.tieneFoto() && !this.fallo());

  readonly iniciales = computed(() =>
    this.nombre()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join(''),
  );

  readonly clases = computed(() => `${FONDOS[this.candidatoId() % FONDOS.length]} ${this.extra()}`);
}
