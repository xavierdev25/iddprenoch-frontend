import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { TiempoRealService } from '../../core/services/tiempo-real.service';
import { Proclamacion } from '../../core/models';
import { FotoCandidatoComponent } from '../../shared/ui/foto-candidato/foto-candidato.component';

/**
 * Pantalla de proyección (prototipo, Figura 18; HU14). Muestra SOLO el ganador que la mesa
 * publica: nunca conteos ni elecciones en curso. Recibe `ganador:proclamado` por Socket.IO y, de
 * respaldo, consulta el último publicado cada 15 s por si el proyector perdió la conexión.
 */
@Component({
  selector: 'app-proyeccion',
  standalone: true,
  imports: [FotoCandidatoComponent],
  template: `
    <div
      class="min-h-dvh flex flex-col text-white px-10 py-8 select-none"
      style="background: radial-gradient(ellipse at center, #136b5c 0%, #0d5246 55%, #093d34 100%)"
    >
      <header class="flex items-center justify-between gap-6 text-xl">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-2xl bg-white/90 text-primary flex items-center justify-center font-bold text-base"
          >
            IDDP
          </div>
          <span>Iglesia de Dios del Perú · Región Norte Chico</span>
        </div>
        <span class="text-right">{{ asamblea() }}</span>
      </header>

      <main
        class="flex-1 flex flex-col items-center justify-center text-center"
        aria-live="assertive"
      >
        @if (proclamado(); as p) {
          <p class="text-[#e8c374] font-bold tracking-[0.35em] text-3xl uppercase">
            {{ p.cargo }}
            @if (p.ronda > 1) {
              · segunda vuelta
            }
          </p>
          <div
            class="mt-10 rounded-full p-2"
            style="background: linear-gradient(160deg, #f0cd7c, #c08a28)"
          >
            <div class="rounded-full p-2 bg-[#0d5246]">
              <app-foto-candidato
                [candidatoId]="p.candidato.id"
                [nombre]="p.candidato.nombre"
                [tieneFoto]="p.candidato.tieneFoto"
                [tamano]="300"
              />
            </div>
          </div>
          <h1 class="font-display text-7xl mt-10 leading-tight">{{ p.candidato.nombre }}</h1>
          <p class="text-3xl mt-4 text-white/85">Electo por la asamblea · Resultado oficial</p>
        } @else {
          <p class="text-[#e8c374] font-bold tracking-[0.35em] text-2xl uppercase">
            Votación electrónica
          </p>
          <h1 class="font-display text-6xl mt-6">{{ asamblea() || 'Cargando…' }}</h1>
          <p class="text-3xl mt-6 text-white/80">Los resultados oficiales aparecerán aquí.</p>
          @if (error()) {
            <p class="text-2xl mt-10 text-[#ffd7d2]">{{ error() }}</p>
          }
        }
      </main>

      <footer class="text-center text-white/60 text-lg">
        Plataforma de votación electrónica · iddprenoch.com
      </footer>
    </div>
  `,
})
export class ProyeccionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tiempoReal = inject(TiempoRealService);
  private readonly title = inject(Title);
  private readonly codigo = (this.route.snapshot.paramMap.get('codigo') ?? '').toUpperCase();
  private suscripcion?: Subscription;
  private respaldo?: ReturnType<typeof setInterval>;

  asamblea = signal('');
  proclamado = signal<Proclamacion | null>(null);
  error = signal('');

  ngOnInit(): void {
    this.title.setTitle('Proyección — IDDP Región Norte Chico');
    this.consultar();
    this.suscripcion = this.tiempoReal
      .proyeccion(this.codigo)
      .subscribe((p) => this.proclamado.set(p));
    this.respaldo = setInterval(() => this.consultar(), 15_000);
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
    clearInterval(this.respaldo);
  }

  private consultar(): void {
    this.tiempoReal.estadoProyeccion(this.codigo).subscribe({
      next: (r) => {
        this.error.set('');
        this.asamblea.set(r.asamblea.nombre);
        const actual = this.proclamado();
        // El respaldo nunca retrocede a un ganador anterior al que ya está en pantalla.
        if (r.proclamado && (!actual || r.proclamado.publicadaEn >= actual.publicadaEn))
          this.proclamado.set(r.proclamado);
      },
      error: (err) =>
        this.error.set(
          err.status === 404 ? 'Código de asamblea no válido.' : 'Sin conexión: reintentando…',
        ),
    });
  }
}
