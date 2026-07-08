import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LideresService } from '../../../../core/services/lideres.service';
import { MinisteriosService } from '../../../../core/services/ministerios.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';
import { stripEmptyStrings } from '../../../../core/utils/clean-payload.util';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-lider-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, SelectComponent, ButtonComponent],
  template: `
    <div class="max-w-lg">
      <div class="mb-6">
        <a
          routerLink="/admin/lideres"
          class="text-sm text-muted hover:text-primary transition-colors"
          >← Volver</a
        >
        <h1 class="font-display text-2xl text-foreground mt-2">
          {{ isEditing() ? 'Editar líder' : 'Nuevo líder' }}
        </h1>
      </div>
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="bg-surface border border-border rounded-xl p-6 space-y-4"
      >
        <div class="grid grid-cols-2 gap-4">
          <app-input
            label="DNI"
            [control]="form.controls.dni"
            placeholder="12345678"
            [required]="true"
          />
          <app-input
            label="Teléfono"
            [control]="form.controls.telefono"
            type="tel"
            placeholder="987 654 321"
          />
        </div>
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
        <app-input
          label="Correo (opcional)"
          [control]="form.controls.correo"
          type="email"
          placeholder="correo@ejemplo.pe"
        />
        <app-select
          label="Ministerio"
          [control]="form.controls.ministerioId"
          [options]="ministerioOptions()"
          [required]="true"
        />
        <app-select
          label="Iglesia"
          [control]="form.controls.iglesiaId"
          [options]="iglesiaOptions()"
          [required]="true"
        />
        @if (error()) {
          <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
            {{ error() }}
          </div>
        }
        <div class="flex gap-3 pt-2">
          <app-button type="submit" [disabled]="loading()">
            {{ loading() ? 'Guardando…' : isEditing() ? 'Guardar cambios' : 'Crear líder' }}
          </app-button>
          <a routerLink="/admin/lideres"
            ><app-button variant="ghost" type="button">Cancelar</app-button></a
          >
        </div>
      </form>
    </div>
  `,
})
export class LiderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(LideresService);
  private readonly ministeriosService = inject(MinisteriosService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breadcrumb = inject(BreadcrumbService);

  isEditing = signal(false);
  loading = signal(false);
  error = signal('');

  ministerios = toSignal(this.ministeriosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });

  ministerioOptions = () => this.ministerios().map((m) => ({ value: m.id, label: m.nombre }));
  iglesiaOptions = () => this.iglesias().map((i) => ({ value: i.id, label: i.nombre }));

  form = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    telefono: [''],
    correo: ['', [Validators.email]],
    ministerioId: [0, [Validators.required, Validators.min(1)]],
    iglesiaId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isEditing.set(true);
      this.service.getById(Number(id)).subscribe((l) => {
        if (l) this.form.patchValue(l);
      });
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Líderes', route: '/admin/lideres' },
        { label: 'Editar' },
      ]);
    } else {
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Líderes', route: '/admin/lideres' },
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
      ministerioId: Number(raw.ministerioId),
      iglesiaId: Number(raw.iglesiaId),
    });
    const id = this.route.snapshot.paramMap.get('id');
    const op = id !== null ? this.service.update(Number(id), data) : this.service.create(data);
    op.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin/lideres']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(err));
      },
    });
  }
}
