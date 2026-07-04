import { Component } from '@angular/core';
import { RecursosNavComponent } from '../shared/recursos-nav/recursos-nav.component';

@Component({
  selector: 'app-plan-operativo',
  standalone: true,
  imports: [RecursosNavComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="mb-8">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">Recursos</p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">
          Plan Operativo 2026
        </h1>
        <p class="text-muted max-w-xl leading-relaxed">
          El Plan Operativo Anual detalla las actividades, responsables y presupuesto para el año en curso,
          en línea con el Plan Estratégico regional.
        </p>
      </div>

      <app-recursos-nav />

      <div class="space-y-4">
        @for (trimestre of trimestres; track trimestre.periodo) {
          <div class="bg-surface border border-border rounded-xl overflow-hidden">
            <div class="px-5 py-3 bg-primary/5 border-b border-border flex items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-primary">{{ trimestre.periodo }}</span>
            </div>
            <ul class="divide-y divide-border">
              @for (actividad of trimestre.actividades; track actividad.nombre) {
                <li class="px-5 py-3 flex items-center justify-between gap-4">
                  <span class="text-sm text-foreground">{{ actividad.nombre }}</span>
                  <span class="text-xs text-muted shrink-0">{{ actividad.responsable }}</span>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </div>
  `,
})
export class PlanOperativoComponent {
  readonly trimestres = [
    {
      periodo: 'I Trimestre — Ene/Feb/Mar',
      actividades: [
        { nombre: 'Retiro espiritual de pastores', responsable: 'Directiva Regional' },
        { nombre: 'Capacitación de tesoreros distritales', responsable: 'Tesorero Regional' },
        { nombre: 'Actualización del padrón de miembros', responsable: 'Secretaría Regional' },
      ],
    },
    {
      periodo: 'II Trimestre — Abr/May/Jun',
      actividades: [
        { nombre: 'Campaña de evangelismo regional', responsable: 'Ministerios' },
        { nombre: 'Asamblea distrital de pastores', responsable: 'Obispos Distritales' },
        { nombre: 'Conferencia de Jóvenes', responsable: 'Min. Jóvenes' },
      ],
    },
    {
      periodo: 'III Trimestre — Jul/Ago/Sep',
      actividades: [
        { nombre: 'Conferencia Regional de Jóvenes', responsable: 'Min. Jóvenes' },
        { nombre: 'Convención del Ministerio de la Mujer', responsable: 'Min. Mujer' },
        { nombre: 'Asamblea Regional Ordinaria', responsable: 'Directiva Regional' },
      ],
    },
    {
      periodo: 'IV Trimestre — Oct/Nov/Dic',
      actividades: [
        { nombre: 'Semana de Oración Regional', responsable: 'Todas las iglesias' },
        { nombre: 'Culto de Unidad Regional', responsable: 'Directiva Regional' },
        { nombre: 'Cierre financiero y rendición de cuentas', responsable: 'Tesorero Regional' },
      ],
    },
  ];
}
