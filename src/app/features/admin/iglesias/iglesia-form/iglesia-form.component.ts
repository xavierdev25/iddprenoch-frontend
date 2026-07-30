import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { DistritosService } from '../../../../core/services/distritos.service';
import { MinisteriosService } from '../../../../core/services/ministerios.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';
import { stripEmptyStrings, valueIfChanged } from '../../../../core/utils/clean-payload.util';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ImageUploadComponent } from '../../../../shared/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-iglesia-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    ImageUploadComponent,
  ],
  template: `
    <div class="max-w-lg">
      <div class="mb-6">
        <a
          routerLink="/admin/iglesias"
          class="text-sm text-muted hover:text-primary transition-colors"
        >
          ← Volver a Iglesias
        </a>
        <h1 class="font-display text-2xl text-foreground mt-2">
          {{ isEditing() ? 'Editar iglesia' : 'Nueva iglesia' }}
        </h1>
      </div>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="bg-surface border border-border rounded-xl p-6 space-y-4"
      >
        <app-input
          label="Nombre"
          [control]="form.controls.nombre"
          placeholder='IDDP "Nombre"'
          [required]="true"
        />
        <app-input
          label="Dirección"
          [control]="form.controls.direccion"
          placeholder="Jr. Ejemplo 123, Ciudad"
          [required]="true"
        />
        <app-select
          label="Distrito"
          [control]="form.controls.distritoId"
          [options]="distritoOptions()"
          [required]="true"
        />
        <app-select
          label="Ministerio (opcional)"
          [control]="form.controls.ministerioId"
          [options]="ministerioOptions()"
          placeholder="Sin ministerio asignado"
        />

        <!-- Ubicación exacta. La mayoría de las sedes no figura como lugar en Google Maps, así
             que no sirve buscarlas por nombre: hay que marcar el punto y traer sus coordenadas. -->
        <div class="pt-2 border-t border-border space-y-3">
          <div>
            <p class="text-sm font-medium text-foreground">Ubicación en el mapa (opcional)</p>
            <p class="text-xs text-muted mt-1">
              En Google Maps, mantén pulsado el punto exacto de la iglesia, copia el enlace y pégalo
              aquí. También puedes pegar las coordenadas como
              <span class="font-mono">-10.7539, -77.7614</span>.
            </p>
          </div>

          <app-input
            label="Enlace de Google Maps o coordenadas"
            [control]="form.controls.mapsUrl"
            placeholder="https://www.google.com/maps/@-10.7539,-77.7614,17z"
          />

          @if (ubicacionActual(); as ubicacion) {
            <div
              class="flex items-center justify-between gap-3 px-3 py-2 rounded bg-primary/5 border border-primary/20"
            >
              <p class="text-xs text-foreground">
                Punto guardado:
                <span class="font-mono">{{ ubicacion.latitud }}, {{ ubicacion.longitud }}</span>
              </p>
              <div class="flex items-center gap-3 shrink-0">
                <a
                  [href]="ubicacion.enlace"
                  target="_blank"
                  rel="noopener"
                  class="text-xs text-primary hover:underline"
                  >Ver en el mapa</a
                >
                <button
                  type="button"
                  (click)="quitarUbicacion()"
                  class="text-xs text-danger hover:underline"
                >
                  Quitar
                </button>
              </div>
            </div>
          } @else {
            <p class="text-xs text-muted">
              Sin punto guardado. El mapa buscará la iglesia por su nombre y dirección, que para
              varias sedes no da con el lugar correcto.
            </p>
          }
        </div>

        <app-image-upload label="Foto de la iglesia (opcional)" [control]="form.controls.foto" />

        @if (error()) {
          <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
            {{ error() }}
          </div>
        }

        <div class="flex gap-3 pt-2">
          <app-button type="submit" [disabled]="loading()">
            {{ loading() ? 'Guardando…' : isEditing() ? 'Guardar cambios' : 'Crear iglesia' }}
          </app-button>
          <a routerLink="/admin/iglesias">
            <app-button variant="ghost" type="button">Cancelar</app-button>
          </a>
        </div>
      </form>
    </div>
  `,
})
export class IglesiaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(IglesiasService);
  private readonly distritosService = inject(DistritosService);
  private readonly ministeriosService = inject(MinisteriosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breadcrumb = inject(BreadcrumbService);

  isEditing = signal(false);
  loading = signal(false);
  error = signal('');

  distritos = toSignal(this.distritosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  ministerios = toSignal(this.ministeriosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });

  distritoOptions = () => this.distritos().map((d) => ({ value: d.id, label: d.nombre }));
  ministerioOptions = () => this.ministerios().map((m) => ({ value: m.id, label: m.nombre }));

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    direccion: ['', [Validators.required]],
    distritoId: [0, [Validators.required, Validators.min(1)]],
    ministerioId: [0],
    foto: [''],
    /** Entrada libre: enlace de Google Maps o coordenadas. El backend extrae de ahí lat/lng. */
    mapsUrl: [''],
  });

  /** Coordenadas ya guardadas para esta iglesia; se limpia al pegar un enlace nuevo o al quitarlas. */
  private readonly coordenadas = signal<{ latitud: number; longitud: number } | null>(null);

  ubicacionActual = computed(() => {
    const punto = this.coordenadas();
    if (!punto) return null;
    return {
      ...punto,
      enlace: `https://www.google.com/maps/search/?api=1&query=${punto.latitud},${punto.longitud}`,
    };
  });

  /**
   * Borra el punto guardado. Se manda `null` explícito y no un campo ausente, porque en un PUT
   * parcial la ausencia significa "no tocar" y la coordenada vieja seguiría en la base.
   */
  quitarUbicacion(): void {
    this.coordenadas.set(null);
    this.form.controls.mapsUrl.setValue('');
    this.form.controls.mapsUrl.markAsDirty();
  }

  /**
   * Tres casos distintos, cada uno con un payload distinto:
   *  - enlace pegado → se manda `mapsUrl` y el backend extrae las coordenadas;
   *  - punto quitado → `null` explícito para que borre las que había;
   *  - sin cambios → nada, para no pisar lo guardado.
   */
  private ubicacionParaGuardar(mapsUrl: string): Record<string, unknown> {
    if (mapsUrl.trim()) return { mapsUrl: mapsUrl.trim() };
    if (this.form.controls.mapsUrl.dirty && !this.coordenadas()) {
      return { latitud: null, longitud: null };
    }
    return {};
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isEditing.set(true);
      this.service.getById(Number(id)).subscribe((i) => {
        if (!i) return;
        // `mapsUrl` se excluye a propósito: la respuesta trae el enlace derivado de las
        // coordenadas, pero este campo es para pegar uno nuevo. Precargarlo lo haría parecer un
        // dato editable y reenviaría el mismo enlace en cada guardado. El punto vigente se
        // muestra aparte, debajo del campo.
        const { mapsUrl: _derivado, ...campos } = i;
        this.form.patchValue(campos);
        if (i.latitud !== undefined && i.longitud !== undefined) {
          this.coordenadas.set({ latitud: i.latitud, longitud: i.longitud });
        }
      });
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Iglesias', route: '/admin/iglesias' },
        { label: 'Editar' },
      ]);
    } else {
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Iglesias', route: '/admin/iglesias' },
        { label: 'Nueva' },
      ]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const id = this.route.snapshot.paramMap.get('id');
    const raw = this.form.getRawValue();
    const data = stripEmptyStrings({
      nombre: raw.nombre,
      direccion: raw.direccion,
      distritoId: Number(raw.distritoId),
      ministerioId: raw.ministerioId ? Number(raw.ministerioId) : undefined,
      foto: valueIfChanged(raw.foto, this.form.controls.foto, id !== null),
      ...this.ubicacionParaGuardar(raw.mapsUrl),
    });
    const op = id !== null ? this.service.update(Number(id), data) : this.service.create(data);
    op.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin/iglesias']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(err));
      },
    });
  }
}
