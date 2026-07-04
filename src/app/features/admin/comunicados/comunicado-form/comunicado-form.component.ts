import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComunicadosService } from '../../../../core/services/comunicados.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';
import { stripEmptyStrings } from '../../../../core/utils/clean-payload.util';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ImageUploadComponent } from '../../../../shared/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-comunicado-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent, ImageUploadComponent],
  template: `
    <div class="max-w-lg">
      <div class="mb-6">
        <a routerLink="/admin/comunicados" class="text-sm text-muted hover:text-primary transition-colors">← Volver</a>
        <h1 class="font-display text-2xl text-foreground mt-2">
          {{ isEditing() ? 'Editar comunicado' : 'Nuevo comunicado' }}
        </h1>
      </div>
      <form [formGroup]="form" (ngSubmit)="submit()" class="bg-surface border border-border rounded-xl p-6 space-y-4">
        <app-input label="Título" [control]="form.controls.titulo" placeholder="Título del comunicado" [required]="true" />
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-foreground">Descripción (opcional)</label>
          <textarea formControlName="descripcion" rows="4"
            class="px-3 py-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Detalle del comunicado…"></textarea>
        </div>
        <app-image-upload label="Imagen (opcional)" [control]="form.controls.imagen" />
        @if (error()) {
          <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">{{ error() }}</div>
        }
        <div class="flex gap-3 pt-2">
          <app-button type="submit" [disabled]="loading()">
            {{ loading() ? 'Guardando…' : (isEditing() ? 'Guardar' : 'Publicar') }}
          </app-button>
          <a routerLink="/admin/comunicados"><app-button variant="ghost" type="button">Cancelar</app-button></a>
        </div>
      </form>
    </div>
  `,
})
export class ComunicadoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ComunicadosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breadcrumb = inject(BreadcrumbService);

  isEditing = signal(false);
  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required]],
    descripcion: [''],
    imagen: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isEditing.set(true);
      this.service.getById(Number(id)).subscribe(c => { if (c) this.form.patchValue(c); });
      this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Comunicados', route: '/admin/comunicados' }, { label: 'Editar' }]);
    } else {
      this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Comunicados', route: '/admin/comunicados' }, { label: 'Nuevo' }]);
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const data = stripEmptyStrings(this.form.getRawValue());
    const id = this.route.snapshot.paramMap.get('id');
    const op = id !== null ? this.service.update(Number(id), data) : this.service.create(data);
    op.subscribe({
      next: () => { this.loading.set(false); void this.router.navigate(['/admin/comunicados']); },
      error: (err) => { this.loading.set(false); this.error.set(extractErrorMessage(err)); },
    });
  }
}
