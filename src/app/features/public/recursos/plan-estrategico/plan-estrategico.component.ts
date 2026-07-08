import { Component } from '@angular/core';
import { RecursosNavComponent } from '../shared/recursos-nav/recursos-nav.component';

@Component({
  selector: 'app-plan-estrategico',
  standalone: true,
  imports: [RecursosNavComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="mb-8">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">Recursos</p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">Plan Estratégico</h1>
        <p class="text-muted max-w-xl leading-relaxed">
          El Plan Estratégico 2024–2028 de la IDDP Región Norte Chico establece la visión, objetivos
          y líneas de acción que guían el crecimiento de la región en los próximos años.
        </p>
      </div>

      <app-recursos-nav />

      <div class="bg-surface border border-border rounded-xl p-8">
        <div class="flex items-start gap-4 mb-6">
          <div
            class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-2xl"
          >
            📋
          </div>
          <div>
            <h2 class="font-semibold text-foreground">Plan Estratégico 2024–2028</h2>
            <p class="text-sm text-muted mt-1">Documento oficial de la Región Norte Chico</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          @for (eje of ejes; track eje.titulo) {
            <div class="p-4 border border-border rounded-lg bg-background">
              <h3 class="font-medium text-foreground text-sm mb-1">{{ eje.titulo }}</h3>
              <p class="text-xs text-muted leading-relaxed">{{ eje.descripcion }}</p>
            </div>
          }
        </div>

        <div class="p-4 bg-primary/5 border border-primary/15 rounded-lg text-sm text-muted">
          Para acceder al documento completo en PDF, contacta a la Secretaría Regional.
        </div>
      </div>
    </div>
  `,
})
export class PlanEstrategicoComponent {
  readonly ejes = [
    {
      titulo: 'Crecimiento espiritual',
      descripcion: 'Profundizar la vida devocional y el discipulado en todas las congregaciones.',
    },
    {
      titulo: 'Multiplicación',
      descripcion: 'Abrir dos nuevas congregaciones en zonas sin alcance durante el período.',
    },
    {
      titulo: 'Formación de líderes',
      descripcion: 'Capacitar a 50 líderes locales a través del instituto ministerial regional.',
    },
    {
      titulo: 'Proyección social',
      descripcion: 'Ampliar los programas de asistencia comunitaria en los seis distritos.',
    },
    {
      titulo: 'Tecnología y gestión',
      descripcion: 'Modernizar los sistemas de gestión para servir mejor a los congregantes.',
    },
    {
      titulo: 'Unidad regional',
      descripcion:
        'Fortalecer la identidad y el compañerismo entre todas las iglesias de la región.',
    },
  ];
}
