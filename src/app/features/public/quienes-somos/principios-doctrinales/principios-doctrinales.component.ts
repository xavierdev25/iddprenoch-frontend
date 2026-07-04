import { Component } from '@angular/core';

interface Principio {
  numero: number;
  titulo: string;
  descripcion: string;
  cita?: string;
}

@Component({
  selector: 'app-principios-doctrinales',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="mb-10">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">Fundamentos</p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">
          Principios Doctrinales
        </h1>
        <p class="text-muted max-w-xl leading-relaxed">
          La Iglesia de Dios del Perú sustenta su fe y práctica en las siguientes {{ principios.length }} verdades
          bíblicas fundamentales.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        @for (principio of principios; track principio.numero) {
          <div class="border border-border rounded-lg p-5 bg-surface hover:border-primary/25 transition-colors">
            <div class="flex items-baseline gap-3 mb-1.5">
              <span class="font-display text-2xl font-semibold text-primary/25 leading-none shrink-0">
                {{ principio.numero < 10 ? '0' + principio.numero : principio.numero }}
              </span>
              <h2 class="font-semibold text-foreground">{{ principio.titulo }}</h2>
            </div>
            <p class="text-sm text-muted leading-relaxed pl-[2.1rem]">{{ principio.descripcion }}</p>
            @if (principio.cita) {
              <p class="text-xs text-secondary font-medium mt-2 pl-[2.1rem]">{{ principio.cita }}</p>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class PrincipiosDoctrinalesComponent {
  readonly principios: Principio[] = [
    { numero: 1, titulo: 'La Biblia', descripcion: 'Creemos que la Santa Biblia es la Palabra inspirada e infalible de Dios, única regla de fe y práctica para el cristiano.' },
    { numero: 2, titulo: 'La Trinidad', descripcion: 'Creemos en un solo Dios eternamente existente en tres personas: Padre, Hijo y Espíritu Santo.' },
    { numero: 3, titulo: 'Jesucristo', descripcion: 'Creemos en la deidad de Jesucristo, su nacimiento virginal, vida sin pecado, milagros, muerte vicaria, resurrección corporal y ascensión.' },
    { numero: 4, titulo: 'La Salvación', descripcion: 'Creemos que la salvación es por gracia mediante la fe en Jesucristo, quien murió por nuestros pecados y resucitó para nuestra justificación.' },
    { numero: 5, titulo: 'El Espíritu Santo', descripcion: 'Creemos en el bautismo del Espíritu Santo con la evidencia de hablar en otras lenguas.', cita: 'Hechos 2:4' },
    { numero: 6, titulo: 'La Iglesia', descripcion: 'Creemos en la Iglesia universal de Cristo, expresada en congregaciones locales que se reúnen para adorar, crecer y servir.' },
    { numero: 7, titulo: 'La Segunda Venida', descripcion: 'Creemos en la segunda venida personal, visible y gloriosa de Jesucristo, esperanza bienaventurada de la Iglesia.' },
  ];
}
