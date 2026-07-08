import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PastoresService } from '../../../../core/services/pastores.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { CargosService } from '../../../../core/services/cargos.service';
import { DistritosService } from '../../../../core/services/distritos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';
import { stripEmptyStrings } from '../../../../core/utils/clean-payload.util';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ImageUploadComponent } from '../../../../shared/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-pastor-form',
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
          routerLink="/admin/pastores"
          class="text-sm text-muted hover:text-primary transition-colors"
          >← Volver</a
        >
        <h1 class="font-display text-2xl text-foreground mt-2">
          {{ isEditing() ? 'Editar pastor' : 'Nuevo pastor' }}
        </h1>
      </div>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="bg-surface border border-border rounded-xl p-6 space-y-4"
      >
        <app-input
          label="Nombre completo"
          [control]="form.controls.nombrePastor"
          placeholder="Pbro. Nombre Apellido"
          [required]="true"
        />
        <app-select
          label="Iglesia"
          [control]="form.controls.iglesiaId"
          [options]="iglesiaOptions()"
          [required]="true"
        />
        <app-select
          label="Cargo"
          [control]="form.controls.cargoId"
          [options]="cargoOptions()"
          [required]="true"
        />
        <app-select
          label="Distrito (opcional)"
          [control]="form.controls.distritoId"
          [options]="distritoOptions()"
          placeholder="Sin distrito asignado"
        />
        <app-input
          label="Celular (opcional)"
          [control]="form.controls.celular"
          type="tel"
          placeholder="987 654 321"
        />
        <app-image-upload label="Foto de perfil (opcional)" [control]="form.controls.foto" />

        @if (error()) {
          <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
            {{ error() }}
          </div>
        }

        <div class="flex gap-3 pt-2">
          <app-button type="submit" [disabled]="loading()">
            {{ loading() ? 'Guardando…' : isEditing() ? 'Guardar cambios' : 'Crear pastor' }}
          </app-button>
          <a routerLink="/admin/pastores">
            <app-button variant="ghost" type="button">Cancelar</app-button>
          </a>
        </div>
      </form>
    </div>
  `,
})
export class PastorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PastoresService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly cargosService = inject(CargosService);
  private readonly distritosService = inject(DistritosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breadcrumb = inject(BreadcrumbService);

  isEditing = signal(false);
  loading = signal(false);
  error = signal('');

  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  cargos = toSignal(this.cargosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  distritos = toSignal(this.distritosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });

  iglesiaOptions = () => this.iglesias().map((i) => ({ value: i.id, label: i.nombre }));
  cargoOptions = () => this.cargos().map((c) => ({ value: c.id, label: c.nombre }));
  distritoOptions = () => this.distritos().map((d) => ({ value: d.id, label: d.nombre }));

  form = this.fb.nonNullable.group({
    nombrePastor: ['', [Validators.required]],
    iglesiaId: [0, [Validators.required, Validators.min(1)]],
    cargoId: [0, [Validators.required, Validators.min(1)]],
    distritoId: [0],
    celular: [''],
    foto: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isEditing.set(true);
      this.service.getById(Number(id)).subscribe((p) => {
        if (p) this.form.patchValue(p);
      });
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Pastores', route: '/admin/pastores' },
        { label: 'Editar' },
      ]);
    } else {
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Pastores', route: '/admin/pastores' },
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
      cargoId: Number(raw.cargoId),
      distritoId: raw.distritoId ? Number(raw.distritoId) : undefined,
    });
    const id = this.route.snapshot.paramMap.get('id');
    const op = id !== null ? this.service.update(Number(id), data) : this.service.create(data);
    op.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin/pastores']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(err));
      },
    });
  }
}
