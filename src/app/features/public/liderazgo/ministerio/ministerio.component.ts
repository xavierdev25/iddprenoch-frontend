import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MinisteriosService } from '../../../../core/services/ministerios.service';
import { LideresService, LiderPublico } from '../../../../core/services/lideres.service';
import { Ministerio } from '../../../../core/models';
import { SeoService } from '../../../../core/services/seo.service';

interface MinisterioAccent {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

const ACCENTS: Record<string, MinisterioAccent> = {
  mujer: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-t-rose-400', icon: '🌷' },
  varones: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-t-blue-400', icon: '🛡️' },
  jovenes: {
    bg: 'bg-secondary/10',
    text: 'text-secondary',
    border: 'border-t-secondary',
    icon: '🔥',
  },
  infantil: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-t-amber-400',
    icon: '⭐',
  },
  musica: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600',
    border: 'border-t-violet-400',
    icon: '🎵',
  },
  social: { bg: 'bg-success/10', text: 'text-success', border: 'border-t-success', icon: '🤲' },
};
const DEFAULT_ACCENT: MinisterioAccent = {
  bg: 'bg-primary/10',
  text: 'text-primary',
  border: 'border-t-primary',
  icon: '✝️',
};

@Component({
  selector: 'app-ministerio',
  standalone: true,
  template: `
    <div class="max-w-5xl mx-auto px-4 py-12">
      @if (ministerio(); as m) {
        <div class="mb-10 flex items-start gap-5">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            [class]="accent(m.slug).bg"
          >
            {{ accent(m.slug).icon }}
          </div>
          <div>
            <p
              class="text-sm font-medium tracking-widest uppercase mb-2"
              [class]="accent(m.slug).text"
            >
              Liderazgo
            </p>
            <h1 class="font-display text-4xl sm:text-5xl text-foreground mb-3">
              {{ m.nombre }}
            </h1>
            @if (m.descripcion) {
              <p class="text-muted max-w-xl leading-relaxed">{{ m.descripcion }}</p>
            }
          </div>
        </div>

        <div class="mt-8">
          <h2 class="font-semibold text-foreground mb-4">Equipo de liderazgo</h2>
          @if (lideres().length === 0) {
            <div class="py-10 text-center bg-surface border border-dashed border-border rounded-lg">
              <p class="text-2xl mb-2">{{ accent(m.slug).icon }}</p>
              <p class="text-muted text-sm">Aún no hay líderes registrados para este ministerio.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (lider of lideres(); track lider.id) {
                <div
                  class="bg-surface border border-border rounded-lg p-4 border-t-[3px]"
                  [class]="accent(m.slug).border"
                >
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center mb-3"
                    [class]="accent(m.slug).bg"
                  >
                    <svg
                      class="w-5 h-5"
                      [class]="accent(m.slug).text"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 class="font-semibold text-foreground text-sm">
                    {{ lider.nombre }} {{ lider.apellido }}
                  </h3>
                </div>
              }
            </div>
          }
        </div>
      } @else if (cargando()) {
        <div class="py-20 text-center text-muted">Cargando…</div>
      } @else {
        <div class="py-20 text-center">
          <h1 class="font-display text-3xl text-foreground mb-2">Ministerio no encontrado</h1>
          <p class="text-muted">El ministerio que buscas no existe o aún no está configurado.</p>
        </div>
      }
    </div>
  `,
})
export class MinisterioComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly ministeriosService = inject(MinisteriosService);
  private readonly lideresService = inject(LideresService);
  private readonly seoService = inject(SeoService);

  ministerio = signal<Ministerio | null>(null);
  // LiderPublico: solo { id, nombre, apellido, ministerioId } — el endpoint
  // público reducido no expone iglesia, dni, teléfono ni correo.
  lideres = signal<LiderPublico[]>([]);
  cargando = signal(true);

  private subs = new Subscription();

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        const slug = params.get('slug') ?? '';
        this.cargando.set(true);
        this.ministeriosService.getBySlug(slug).subscribe({
          next: (m) => {
            this.ministerio.set(m);
            this.cargando.set(false);
            this.seoService.setPage(
              `${m.nombre} — IDDP Norte Chico`,
              m.descripcion || `Ministerio de ${m.nombre} de la Iglesia de Dios del Perú — Región Norte Chico.`,
            );
          },
          error: () => {
            this.ministerio.set(null);
            this.cargando.set(false);
          },
        });
        // Página pública: usar SIEMPRE el endpoint reducido de líderes
        // (sin dni/telefono/correo, sin sesión). Nunca /api/lideres aquí.
        this.lideresService.getPublicByMinisterioSlug(slug).subscribe({
          next: (list) => this.lideres.set(list),
          error: () => this.lideres.set([]),
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  accent(slug: string | undefined): MinisterioAccent {
    return (slug ? ACCENTS[slug] : undefined) ?? DEFAULT_ACCENT;
  }
}
