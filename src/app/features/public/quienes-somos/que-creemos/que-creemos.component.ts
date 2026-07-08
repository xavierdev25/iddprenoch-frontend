import { Component } from '@angular/core';

@Component({
  selector: 'app-que-creemos',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="mb-10">
        <p class="text-primary text-sm font-medium tracking-widest uppercase mb-2">
          Declaración de fe
        </p>
        <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">Qué Creemos</h1>
        <p class="text-muted max-w-xl leading-relaxed">
          Nuestra declaración de fe resume las verdades centrales que guían nuestra vida como
          comunidad y nuestra misión en el mundo.
        </p>
      </div>

      <!-- Credo: filas compactas, escaneables -->
      <div
        class="border border-border rounded-xl overflow-hidden bg-surface divide-y divide-border"
      >
        @for (articulo of articulos; track articulo.sujeto) {
          <div class="flex items-start gap-4 p-5">
            <span
              class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary text-sm"
              >✝</span
            >
            <p class="text-muted leading-relaxed">
              <strong class="text-foreground">Creemos en {{ articulo.sujeto }}</strong
              >, {{ articulo.texto }}
            </p>
          </div>
        }
      </div>

      <!-- Cita central — elemento signature de la página -->
      <blockquote
        class="mt-10 bg-foreground rounded-xl px-8 py-10 text-center relative overflow-hidden"
      >
        <span
          class="absolute left-4 top-2 font-display text-[100px] leading-none text-white/[.06] select-none"
          aria-hidden="true"
          >"</span
        >
        <p
          class="font-display italic text-xl sm:text-2xl text-white relative leading-snug max-w-xl mx-auto"
        >
          Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo
          aquel que en él cree, no se pierda, mas tenga vida eterna.
        </p>
        <cite class="block text-sm text-secondary font-medium not-italic mt-4 relative"
          >— Juan 3:16</cite
        >
      </blockquote>
    </div>
  `,
})
export class QueCreeemosComponent {
  readonly articulos = [
    {
      sujeto: 'Dios el Padre Todopoderoso',
      texto:
        'creador del cielo y la tierra, quien en su amor infinito envió a su Hijo al mundo para salvarnos.',
    },
    {
      sujeto: 'Jesucristo',
      texto:
        'su único Hijo y Señor, concebido por el Espíritu Santo, nacido de la virgen María, quien murió por nuestros pecados, resucitó al tercer día y está sentado a la diestra del Padre.',
    },
    {
      sujeto: 'el Espíritu Santo',
      texto:
        'quien mora en los creyentes, los capacita para vivir una vida santa y empoderarlos para el servicio y el testimonio.',
    },
    {
      sujeto: 'la Iglesia',
      texto:
        'cuerpo de Cristo, compuesta por todos los que han nacido de nuevo, llamados a adorar a Dios, edificarse mutuamente y extender su reino en el mundo.',
    },
    {
      sujeto: 'la vida eterna',
      texto:
        'para los que son salvos por la gracia de Dios mediante la fe en Cristo, y en el juicio final para todos los seres humanos.',
    },
  ];
}
