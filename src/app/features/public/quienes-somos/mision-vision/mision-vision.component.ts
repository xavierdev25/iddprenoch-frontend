import { Component } from '@angular/core';

@Component({
  selector: 'app-mision-vision',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="mb-10">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">Nuestra identidad</p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground">
          Misión, Visión y Valores
        </h1>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="p-7 bg-foreground text-white rounded-xl relative overflow-hidden">
          <span class="absolute -right-3 -top-3 font-display text-[110px] leading-none text-white/[.06] select-none" aria-hidden="true">"</span>
          <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white text-lg mb-4 relative">🎯</div>
          <h2 class="text-white text-2xl mb-3 relative">Misión</h2>
          <p class="text-white/70 leading-relaxed relative">
            Proclamar el evangelio de Jesucristo en la Región Norte Chico, formando discípulos íntegros
            que vivan y extiendan el reino de Dios en sus familias, iglesias y comunidades locales.
          </p>
        </div>

        <div class="p-7 bg-foreground text-white rounded-xl relative overflow-hidden">
          <span class="absolute -right-3 -top-3 font-display text-[110px] leading-none text-white/[.06] select-none" aria-hidden="true">"</span>
          <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-white text-lg mb-4 relative">🌅</div>
          <h2 class="text-white text-2xl mb-3 relative">Visión</h2>
          <p class="text-white/70 leading-relaxed relative">
            Ser una red de iglesias vivas, unidas y en crecimiento, que transformen la región Norte Chico
            con el amor de Cristo, siendo reconocidos por nuestra integridad, servicio y comunidad.
          </p>
        </div>
      </div>

      <!-- Valores: ítems discretos, tratamiento de chip -->
      <div class="mt-10">
        <h2 class="text-2xl text-foreground mb-1">Nuestros valores</h2>
        <p class="text-sm text-muted mb-5">Los seis principios que guían nuestra vida en comunidad.</p>
        <div class="flex flex-wrap gap-2.5">
          @for (valor of valores; track valor.nombre) {
            <div class="group relative flex items-center gap-2 pl-2.5 pr-4 py-2 bg-surface border border-border rounded-full hover:border-primary/40 transition-colors">
              <span class="text-base leading-none">{{ valor.icon }}</span>
              <span class="text-sm font-medium text-foreground">{{ valor.nombre }}</span>
              <div class="absolute left-0 top-full mt-1.5 w-56 p-3 bg-foreground text-white/90 text-xs leading-relaxed rounded-lg opacity-0 invisible
                          group-hover:opacity-100 group-hover:visible transition-all duration-150 z-10 pointer-events-none">
                {{ valor.descripcion }}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class MisionVisionComponent {
  readonly valores = [
    { icon: '📖', nombre: 'Fe bíblica', descripcion: 'La Biblia como autoridad suprema para la vida y la doctrina.' },
    { icon: '❤️', nombre: 'Amor fraterno', descripcion: 'Comunidad genuina donde todos son bienvenidos y valorados.' },
    { icon: '🙏', nombre: 'Oración', descripcion: 'La oración como columna vertebral de toda la vida eclesial.' },
    { icon: '✝️', nombre: 'Discipulado', descripcion: 'Formación continua de creyentes maduros que forman a otros.' },
    { icon: '🌍', nombre: 'Servicio', descripcion: 'Compromiso práctico con las necesidades de la comunidad.' },
    { icon: '🤝', nombre: 'Integridad', descripcion: 'Coherencia entre lo que creemos, decimos y hacemos.' },
  ];
}
