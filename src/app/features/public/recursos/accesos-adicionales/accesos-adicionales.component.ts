import { Component } from '@angular/core';
import { RecursosNavComponent } from '../shared/recursos-nav/recursos-nav.component';

@Component({
  selector: 'app-accesos-adicionales',
  standalone: true,
  imports: [RecursosNavComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="mb-8">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">Recursos</p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">Accesos Adicionales</h1>
        <p class="text-muted max-w-xl leading-relaxed">
          Documentos, formularios y enlaces útiles para pastores, líderes y miembros de la región.
        </p>
      </div>

      <app-recursos-nav />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        @for (recurso of recursos; track recurso.titulo) {
          <div
            class="bg-surface border border-border rounded-lg p-5 flex items-start gap-4 hover:border-primary/30 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xl"
            >
              {{ recurso.icon }}
            </div>
            <div>
              <h3 class="font-semibold text-foreground text-sm">{{ recurso.titulo }}</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">{{ recurso.descripcion }}</p>
              <span class="inline-block mt-2 text-xs text-primary font-medium">
                {{ recurso.tipo }}
              </span>
            </div>
          </div>
        }
      </div>

      <div class="mt-8 p-5 bg-surface border border-border rounded-xl text-sm text-muted">
        <p class="font-medium text-foreground mb-1">¿Necesitas un documento que no aparece aquí?</p>
        <p>
          Contáctanos en la Secretaría Regional:
          <a href="mailto:secretaria@iddp.pe" class="text-primary hover:underline"
            >secretaria&#64;iddp.pe</a
          >
        </p>
      </div>
    </div>
  `,
})
export class AccesosAdicionalesComponent {
  readonly recursos = [
    {
      icon: '📄',
      titulo: 'Formulario de actualización de datos',
      descripcion: 'Actualiza los datos de tu iglesia o congregantes para el padrón 2026.',
      tipo: 'Formulario PDF',
    },
    {
      icon: '📊',
      titulo: 'Informe financiero 2025',
      descripcion:
        'Resumen del movimiento financiero regional del año anterior, aprobado en asamblea.',
      tipo: 'Documento PDF',
    },
    {
      icon: '📋',
      titulo: 'Estatutos regionales',
      descripcion:
        'El reglamento interno actualizado que rige la organización y gobierno de la región.',
      tipo: 'Documento PDF',
    },
    {
      icon: '🎓',
      titulo: 'Material del Instituto Ministerial',
      descripcion: 'Materiales de formación para los cursos del Instituto Ministerial Regional.',
      tipo: 'Recurso educativo',
    },
    {
      icon: '🗃️',
      titulo: 'Formatos de actas y resoluciones',
      descripcion:
        'Plantillas oficiales para las actas de asambleas distritales y congregacionales.',
      tipo: 'Plantillas Word',
    },
    {
      icon: '📅',
      titulo: 'Calendario regional 2026',
      descripcion:
        'Todas las fechas de actividades regionales del año, incluyendo asambleas y conferencias.',
      tipo: 'Calendario PDF',
    },
  ];
}
