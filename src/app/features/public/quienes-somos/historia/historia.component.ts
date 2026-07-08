import { Component } from '@angular/core';

@Component({
  selector: 'app-historia',
  standalone: true,
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      <div class="mb-12">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">
          Nuestro camino
        </p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">Historia</h1>
        <p class="text-muted max-w-xl leading-relaxed">
          Ocho décadas de fe pentecostal, desde su origen hasta su llegada y consolidación en el
          Perú.
        </p>
      </div>

      <!-- Línea de tiempo -->
      <div class="relative">
        <div class="absolute left-[27px] top-2 bottom-2 w-px bg-border" aria-hidden="true"></div>

        <div class="space-y-10">
          @for (hito of hitos; track hito.anio) {
            <div class="relative flex gap-6">
              <div
                class="relative shrink-0 w-14 h-14 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10"
              >
                <span class="font-display text-sm font-semibold text-primary">{{ hito.anio }}</span>
              </div>
              <div class="pt-2.5">
                <h2 class="font-semibold text-foreground">{{ hito.titulo }}</h2>
                <p class="text-sm text-muted mt-1.5 leading-relaxed max-w-lg">{{ hito.texto }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class HistoriaComponent {
  readonly hitos = [
    {
      anio: '1886',
      titulo: 'Origen del movimiento pentecostal',
      texto:
        'La Asociación de la Iglesia de Dios del Perú tiene sus raíces en el movimiento pentecostal que se originó en los Estados Unidos.',
    },
    {
      anio: '1945',
      titulo: 'Primer contacto con Perú',
      texto:
        'El misionero Vessie D. Hargrave visitó el país y comenzó a establecer relaciones con líderes locales.',
    },
    {
      anio: '1947',
      titulo: 'Primeras congregaciones afiliadas',
      texto:
        'Se consolidaron las primeras congregaciones afiliadas a la denominación en territorio peruano.',
    },
    {
      anio: '1952',
      titulo: 'Constitución legal en Perú',
      texto:
        'Se formalizó la constitución legal de la iglesia en Perú, dando marco institucional a su crecimiento.',
    },
    {
      anio: 'Hoy',
      titulo: 'Crecimiento y expansión regional',
      texto:
        'La Asociación ha crecido y se ha expandido a diversos distritos del país, promoviendo la fe cristiana y desarrollando programas educativos y sociales en beneficio de sus comunidades.',
    },
  ];
}
