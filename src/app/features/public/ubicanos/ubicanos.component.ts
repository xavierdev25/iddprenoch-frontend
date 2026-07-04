import { Component } from '@angular/core';
import { IglesiaLocalizadorComponent } from '../shared/iglesia-localizador/iglesia-localizador.component';

@Component({
  selector: 'app-ubicanos',
  standalone: true,
  imports: [IglesiaLocalizadorComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-12">
      <div class="mb-10">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">Directorio de congregaciones</p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">
          Ubícanos
        </h1>
        <p class="text-muted max-w-xl leading-relaxed">
          Selecciona tu distrito y encuentra la iglesia más cercana. Todas nuestras congregaciones
          tienen culto los domingos y actividades durante la semana.
        </p>
      </div>

      <app-iglesia-localizador />

      <div class="mt-12 p-6 bg-primary/5 border border-primary/15 rounded-xl">
        <h2 class="font-semibold text-foreground mb-2">¿No encuentras tu iglesia?</h2>
        <p class="text-sm text-muted leading-relaxed">
          Contáctanos a través de la Secretaría Regional al <strong>987 654 321</strong> o escríbenos a
          <a href="mailto:secretaria@iddp.pe" class="text-primary hover:underline">secretaria&#64;iddp.pe</a>
          y te ayudaremos a conectarte con la congregación más cercana.
        </p>
      </div>
    </div>
  `,
})
export class UbicanosComponent {}
