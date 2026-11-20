import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AsambleasService } from '../../../core/services/asambleas.service';
import { AuthService } from '../../../core/services/auth.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { DistritosService } from '../../../core/services/distritos.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';
import { Asamblea, TipoAsamblea } from '../../../core/models';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { BADGE_ASAMBLEA, formatearFecha } from './estado-badge';

@Component({
  selector: 'app-asambleas-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    SelectComponent,
  ],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Asambleas</h1>
          <p class="text-muted text-sm mt-0.5">Votación electrónica en asambleas presenciales</p>
        </div>
        <app-button (clicked)="abrirNueva()">+ Nueva asamblea</app-button>
      </div>

      @if (asambleas().length === 0 && !cargando()) {
        <div class="bg-surface border border-border rounded-xl px-4 py-16 text-center">
          <p class="text-3xl mb-2" aria-hidden="true">🗳️</p>
          <p class="text-foreground font-medium">Aún no hay asambleas</p>
          <p class="text-muted text-sm mt-1">
            Crea la primera para cargar sus cargos, candidatos y padrón.
          </p>
        </div>
      }

      <div class="grid gap-3">
        @for (a of asambleas(); track a.id) {
          <a
            [routerLink]="['/admin/asambleas', a.id]"
            class="bg-surface border border-border rounded-xl p-5 flex flex-wrap items-center gap-4 hover:border-primary/40 transition-colors"
          >
            <div class="flex-1 min-w-[220px]">
              <p class="font-display text-xl text-foreground">{{ a.nombre }}</p>
              <p class="text-sm text-muted mt-0.5">
                {{ fecha(a.fecha) }} ·
                {{ a.tipo === 'REGIONAL' ? 'Regional' : 'Distrital — ' + a.distrito }}
              </p>
            </div>
            <div class="text-sm text-muted">
              {{ a.elecciones }} cargos · {{ a.electores }} en el padrón
            </div>
            <app-badge [color]="badge[a.estado].color">{{ badge[a.estado].texto }}</app-badge>
          </a>
        }
      </div>
    </div>

    <app-modal [isOpen]="modal()" title="Nueva asamblea" (closed)="modal.set(false)">
      <form [formGroup]="form" (ngSubmit)="crear()" class="space-y-4">
        <app-input
          label="Nombre"
          [control]="form.controls.nombre"
          placeholder="Asamblea Regional Ordinaria 2026"
          [required]="true"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <app-select
            label="Tipo"
            [control]="form.controls.tipo"
            [options]="tipoOptions()"
            [required]="true"
            placeholder=""
          />
          @if (form.controls.tipo.value === 'DISTRITAL') {
            <app-select
              label="Distrito"
              [control]="form.controls.distritoId"
              [options]="distritoOptions()"
              [required]="true"
              placeholder="Elegir distrito…"
            />
          }
        </div>
        <app-input
          label="Fecha y hora"
          type="datetime-local"
          [control]="form.controls.fecha"
          [required]="true"
        />
        @if (error()) {
          <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
            {{ error() }}
          </div>
        }
        <div class="flex gap-3 justify-end pt-2">
          <app-button variant="ghost" (clicked)="modal.set(false)">Cancelar</app-button>
          <app-button type="submit" [disabled]="guardando()">{{
            guardando() ? 'Creando…' : 'Crear asamblea'
          }}</app-button>
        </div>
      </form>
    </app-modal>
  `,
})
export class AsambleasListComponent implements OnInit {
  private readonly service = inject(AsambleasService);
  private readonly breadcrumb = inject(BreadcrumbService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly distritoFijo = inject(AuthService).distritoAlcance;

  readonly badge = BADGE_ASAMBLEA;
  readonly fecha = formatearFecha;
  asambleas = signal<Asamblea[]>([]);
  cargando = signal(true);
  modal = signal(false);
  guardando = signal(false);
  error = signal('');

  private readonly distritos = toSignal(
    inject(DistritosService)
      .getAll({ limit: 100 })
      .pipe(map((r) => r.data)),
    { initialValue: [] },
  );

  // El obispo distrital solo puede crear asambleas distritales de su distrito (el backend lo exige).
  tipoOptions = computed(() =>
    this.distritoFijo() === null
      ? [
          { value: 'REGIONAL', label: 'Regional' },
          { value: 'DISTRITAL', label: 'Distrital' },
        ]
      : [{ value: 'DISTRITAL', label: 'Distrital' }],
  );
  distritoOptions = computed(() =>
    this.distritos()
      .filter((d) => this.distritoFijo() === null || d.id === this.distritoFijo())
      .map((d) => ({ value: d.id, label: d.nombre })),
  );

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    tipo: ['REGIONAL' as TipoAsamblea, Validators.required],
    distritoId: [''],
    fecha: ['', Validators.required],
  });

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Asambleas' }]);
    this.service.getAll().subscribe({
      next: (r) => {
        this.asambleas.set(r.data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirNueva(): void {
    const fijo = this.distritoFijo();
    this.form.reset({
      nombre: '',
      tipo: fijo === null ? 'REGIONAL' : 'DISTRITAL',
      distritoId: fijo === null ? '' : String(fijo),
      fecha: '',
    });
    this.error.set('');
    this.modal.set(true);
  }

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set('');
    this.service
      .create({
        nombre: v.nombre.trim(),
        tipo: v.tipo,
        distritoId: v.tipo === 'DISTRITAL' && v.distritoId ? Number(v.distritoId) : null,
        // datetime-local no trae zona: se interpreta como hora de Lima, donde se hace la asamblea.
        fecha: `${v.fecha}:00-05:00`,
      })
      .subscribe({
        next: (a) => void this.router.navigate(['/admin/asambleas', a.id]),
        error: (err) => {
          this.guardando.set(false);
          this.error.set(extractErrorMessage(err));
        },
      });
  }
}
