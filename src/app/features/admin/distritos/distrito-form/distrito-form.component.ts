import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DistritosService } from '../../../../core/services/distritos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-distrito-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <div class="max-w-lg">
      <div class="mb-6">
        <a routerLink="/admin/distritos" class="text-sm text-muted hover:text-primary transition-colors">
          ← Volver a Distritos
        </a>
        <h1 class="font-display text-2xl text-foreground mt-2">
          {{ isEditing() ? 'Editar distrito' : 'Nuevo distrito' }}
        </h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="bg-surface border border-border rounded-xl p-6 space-y-4">
        <app-input
          label="Nombre del distrito"
          [control]="form.controls.nombre"
          placeholder="Ej: Barranca Norte"
          [required]="true" />

        @if (error()) {
          <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">{{ error() }}</div>
        }

        <div class="flex gap-3 pt-2">
          <app-button type="submit" [disabled]="loading()">
            {{ loading() ? 'Guardando…' : (isEditing() ? 'Guardar cambios' : 'Crear distrito') }}
          </app-button>
          <a routerLink="/admin/distritos">
            <app-button variant="ghost" type="button">Cancelar</app-button>
          </a>
        </div>
      </form>
    </div>
  `,
})
export class DistritoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DistritosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breadcrumb = inject(BreadcrumbService);

  isEditing = signal(false);
  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isEditing.set(true);
      this.service.getById(Number(id)).subscribe(d => {
        if (d) this.form.patchValue(d);
      });
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Distritos', route: '/admin/distritos' },
        { label: 'Editar' },
      ]);
    } else {
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Distritos', route: '/admin/distritos' },
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
    const data = this.form.getRawValue();
    const id = this.route.snapshot.paramMap.get('id');
    const op = id !== null
      ? this.service.update(Number(id), data)
      : this.service.create(data);
    op.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin/distritos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(err));
      },
    });
  }
}
