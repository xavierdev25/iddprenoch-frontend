import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CongregantesService } from '../../../../core/services/congregantes.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';
import { stripEmptyStrings } from '../../../../core/utils/clean-payload.util';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ImageUploadComponent } from '../../../../shared/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-congregante-form',
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
    <div class="max-w-2xl">
      <div class="mb-6">
        <a
          routerLink="/admin/congregantes"
          class="text-sm text-muted hover:text-primary transition-colors"
          >← Volver</a
        >
        <h1 class="font-display text-2xl text-foreground mt-2">
          {{ isEditing() ? 'Editar congregante' : 'Nuevo congregante' }}
        </h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
        <!-- Datos personales -->
        <div class="bg-surface border border-border rounded-xl p-6">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
            Datos personales
          </h2>
          <div class="space-y-4">
            <app-image-upload label="Foto (opcional)" [control]="form.controls.foto" />
            <div class="grid grid-cols-2 gap-4">
              <app-input
                label="Nombre"
                [control]="form.controls.nombre"
                placeholder="Nombre"
                [required]="true"
              />
              <app-input
                label="Apellido"
                [control]="form.controls.apellido"
                placeholder="Apellido"
                [required]="true"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <app-input
                label="DNI"
                [control]="form.controls.dni"
                placeholder="12345678"
                [required]="true"
              />
              <app-select
                label="Sexo"
                [control]="form.controls.sexoId"
                [options]="sexoOptions()"
                [required]="true"
              />
            </div>
            <app-select
              label="Estado civil"
              [control]="form.controls.estadoCivilId"
              [options]="estadoCivilOptions()"
              [required]="true"
            />
          </div>
        </div>

        <!-- Contacto -->
        <div class="bg-surface border border-border rounded-xl p-6">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Contacto</h2>
          <div class="grid grid-cols-2 gap-4">
            <app-input
              label="Teléfono"
              [control]="form.controls.telefono"
              type="tel"
              placeholder="987 000 000"
            />
            <app-input
              label="Correo (opcional)"
              [control]="form.controls.correo"
              type="email"
              placeholder="correo@ejemplo.pe"
            />
          </div>
        </div>

        <!-- Datos eclesiales -->
        <div class="bg-surface border border-border rounded-xl p-6">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
            Datos eclesiales
          </h2>
          <div class="space-y-4">
            <app-select
              label="Iglesia"
              [control]="form.controls.iglesiaId"
              [options]="iglesiaOptions()"
              [required]="true"
            />
            <app-select
              label="Estado eclesial"
              [control]="form.controls.estadoEclesialId"
              [options]="estadoEclesialOptions()"
              [required]="true"
            />
            <div class="grid grid-cols-2 gap-4">
              <app-input
                label="Fecha de conversión"
                [control]="form.controls.fechaConversion"
                type="date"
              />
              <app-input
                label="Fecha de bautismo"
                [control]="form.controls.fechaBautismo"
                type="date"
              />
            </div>
          </div>
        </div>

        @if (error()) {
          <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
            {{ error() }}
          </div>
        }

        <div class="flex gap-3">
          <app-button type="submit" [disabled]="loading()">
            {{ loading() ? 'Guardando…' : isEditing() ? 'Guardar cambios' : 'Crear congregante' }}
          </app-button>
          <a routerLink="/admin/congregantes"
            ><app-button variant="ghost" type="button">Cancelar</app-button></a
          >
        </div>
      </form>
    </div>
  `,
})
export class CongregantesFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CongregantesService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breadcrumb = inject(BreadcrumbService);

  isEditing = signal(false);
  loading = signal(false);
  error = signal('');
  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  sexos = toSignal(this.catalogosService.getSexos(), { initialValue: [] });
  estadosCiviles = toSignal(this.catalogosService.getEstadosCiviles(), { initialValue: [] });
  estadosEclesiales = toSignal(this.catalogosService.getEstadosEclesiales(), { initialValue: [] });

  iglesiaOptions = () => this.iglesias().map((i) => ({ value: i.id, label: i.nombre }));
  sexoOptions = () => this.sexos().map((s) => ({ value: s.id, label: s.nombre }));
  estadoCivilOptions = () => this.estadosCiviles().map((e) => ({ value: e.id, label: e.nombre }));
  estadoEclesialOptions = () =>
    this.estadosEclesiales().map((e) => ({ value: e.id, label: e.nombre }));

  form = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    telefono: [''],
    correo: ['', [Validators.email]],
    iglesiaId: [0, [Validators.required, Validators.min(1)]],
    sexoId: [0, [Validators.required, Validators.min(1)]],
    estadoCivilId: [0, [Validators.required, Validators.min(1)]],
    estadoEclesialId: [0, [Validators.required, Validators.min(1)]],
    fechaConversion: [''],
    fechaBautismo: [''],
    foto: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isEditing.set(true);
      this.service.getById(Number(id)).subscribe((c) => {
        if (c) this.form.patchValue(c);
      });
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Congregantes', route: '/admin/congregantes' },
        { label: 'Editar' },
      ]);
    } else {
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Congregantes', route: '/admin/congregantes' },
        { label: 'Nuevo' },
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
    const raw = this.form.getRawValue();
    const data = stripEmptyStrings({
      ...raw,
      iglesiaId: Number(raw.iglesiaId),
      sexoId: Number(raw.sexoId),
      estadoCivilId: Number(raw.estadoCivilId),
      estadoEclesialId: Number(raw.estadoEclesialId),
    });
    const id = this.route.snapshot.paramMap.get('id');
    const op = id !== null ? this.service.update(Number(id), data) : this.service.create(data);
    op.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin/congregantes']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(err));
      },
    });
  }
}
