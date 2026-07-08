import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { DistritosService } from '../../../../core/services/distritos.service';
import { MinisteriosService } from '../../../../core/services/ministerios.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';
import { stripEmptyStrings } from '../../../../core/utils/clean-payload.util';
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
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isEditing.set(true);
      this.service.getById(Number(id)).subscribe((i) => {
        if (i) this.form.patchValue(i);
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
    const raw = this.form.getRawValue();
    const data = stripEmptyStrings({
      nombre: raw.nombre,
      direccion: raw.direccion,
      distritoId: Number(raw.distritoId),
      ministerioId: raw.ministerioId ? Number(raw.ministerioId) : undefined,
      foto: raw.foto,
    });
    const id = this.route.snapshot.paramMap.get('id');
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
