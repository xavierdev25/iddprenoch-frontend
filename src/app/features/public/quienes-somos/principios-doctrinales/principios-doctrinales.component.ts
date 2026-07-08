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
          La Iglesia de Dios del Perú sustenta su fe y práctica en las siguientes
          {{ principios.length }} verdades bíblicas fundamentales.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        @for (principio of principios; track principio.numero) {
          <div
            class="border border-border rounded-lg p-5 bg-surface hover:border-primary/25 transition-colors"
          >
            <div class="flex items-baseline gap-3 mb-1.5">
              <span
                class="font-display text-2xl font-semibold text-primary/25 leading-none shrink-0"
              >
                {{ principio.numero < 10 ? '0' + principio.numero : principio.numero }}
              </span>
              <h2 class="font-semibold text-foreground">{{ principio.titulo }}</h2>
            </div>
            <p class="text-sm text-muted leading-relaxed pl-[2.1rem]">
              {{ principio.descripcion }}
            </p>
            @if (principio.cita) {
              <p class="text-xs text-secondary font-medium mt-2 pl-[2.1rem]">
                {{ principio.cita }}
              </p>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class PrincipiosDoctrinalesComponent {
  readonly principios: Principio[] = [
    {
      numero: 1,
      titulo: 'Arrepentimiento',
      descripcion:
        'Dios llama a todas las personas a arrepentirse, creer en el evangelio y volverse a Él, para recibir el perdón de sus pecados y la vida que ofrece en su reino.',
      cita: 'Marcos 1:15; Lucas 13:3; Hechos 3:19.'
    },
    {
      numero: 2,
      titulo: 'Justificación',
      descripcion:
        'Somos justificados por la gracia de Dios mediante la fe, y gracias a ello tenemos paz con Dios y la esperanza de la vida eterna.',
      cita: 'Romanos 5:1; Tito 3:7.'
    },
    {
      numero: 3,
      titulo: 'Regeneración',
      descripcion:
        'Dios nos salvó, no por nuestras obras, sino por su misericordia, mediante el nuevo nacimiento y la renovación del Espíritu Santo.',
      cita: 'Tito 3:5.'
    },
    {
      numero: 4,
      titulo: 'Nuevo nacimiento',
      descripcion:
        'Para entrar en el reino de Dios es necesario nacer de nuevo; este nuevo nacimiento proviene de la Palabra de Dios y produce una vida transformada.',
      cita: 'Juan 3:3; 1 Pedro 1:23; 1 Juan 3:9.'
    },
    {
      numero: 5,
      titulo: 'Santificación, subsecuente a la justificación',
      descripcion:
        'Por medio de Cristo recibimos la gracia de Dios, somos santificados y llamados a vivir una vida santa conforme a su voluntad.',
      cita: 'Romanos 5:2; 1 Corintios 1:30; 1 Tesalonicenses 4:3; Hebreos 13:12.',
    },
    {
      numero: 6,
      titulo: 'Santidad',
      descripcion:
        'Dios nos llamó a vivir en santidad; debemos buscar una vida santa y en paz, porque la santidad es esencial para estar en su presencia.',
      cita: 'Lucas 1:75; 1 Tesalonicenses 4:7; Hebreos 12:14.'
    },
    {
      numero: 7,
      titulo: 'Bautismo en agua',
      descripcion:
        'Jesús mandó bautizar a los creyentes, dio ejemplo al ser bautizado, y el bautismo se practicó en agua como una expresión pública de la fe.',
      cita: 'Mateo 28:19; Marcos 1:9-10; Juan 3:22-23; Hechos 8:36, 38.'
    },
    {
      numero: 8,
      titulo: 'Bautismo en el Espíritu Santo, subsecuente a la limpieza',
      descripcion:
        'Jesús prometió el bautismo en el Espíritu Santo para dar poder a sus discípulos y capacitarlos para ser sus testigos.',
      cita: 'Mateo 3:11; Lucas 24:49-53; Hechos 1:4-8.'
    },
    {
      numero: 9,
      titulo: 'Hablar en lenguas como evidencia inicial del bautismo en el Espíritu Santo',
      descripcion:
        'El Espíritu Santo fue enviado por Jesús, llena a los creyentes y se manifiesta con poder, capacitándolos para servir y dar testimonio.',
      cita: 'Juan 15:26; Hechos 2:4; 10:44-46; 19:1-7.'
    },
    {
      numero: 10,
      titulo: 'Dones espirituales',
      descripcion:
        'El Espíritu Santo concede diversos dones para el beneficio de la iglesia, y los creyentes deben anhelarlos, especialmente aquellos que edifican a los demás.',
      cita: 'Corintios 12:1, 7, 10, 28, 31; 14:1.'
    },
    {
      numero: 11,
      titulo: 'Las señales siguen a los creyentes',
      descripcion:
        'Dios confirma el mensaje del evangelio mediante señales, milagros y la obra del Espíritu Santo.',
      cita: 'Marcos 16:17-20; Romanos 15:18-19; Hebreos 2:4.'
    },
    {
      numero: 12,
      titulo: 'El fruto del Espíritu',
      descripcion:
        'La vida del creyente debe producir el fruto del Espíritu, reflejando justicia, bondad, amor y una conducta que glorifique a Dios.',
      cita: 'Romanos 6:22; Gálatas 5:22-23; Efesios 5:9; Filipenses 1:11.'
    },
    {
      numero: 13,
      titulo: 'Sanidad divina',
      descripcion:
        'Dios es quien sana, y por la obra de Cristo hay provisión para el perdón y la sanidad; por ello, los creyentes deben acudir a Él con fe y oración.',
      cita: 'Salmo 103:3; Isaías 53:4-5; Mateo 8:17; Santiago 5:14-16; 1 Pedro 2:24.'
    }, {
      numero: 14,
      titulo: 'La cena del Señor',
      descripcion:
        'La Cena del Señor fue instituida por Jesús para recordar su sacrificio, anunciar su muerte y renovar la comunión con Él hasta su regreso.',
      cita: 'Lucas 22:17-20; 1 Corintios 11:23-26.'
    },
  ];
}
