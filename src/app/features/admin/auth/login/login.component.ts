import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <!-- Brand -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-3">
            I
          </div>
          <h1 class="font-display text-2xl text-foreground">Panel Administrativo</h1>
          <p class="text-muted text-sm mt-1">IDDP Región Norte Chico</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submit()" class="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <app-input
            label="Usuario"
            [control]="form.controls.nombre"
            type="text"
            placeholder="admin"
            [required]="true" />

          <app-input
            label="Contraseña"
            [control]="form.controls.password"
            type="password"
            placeholder="••••••••"
            [required]="true" />

          @if (error()) {
            <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
              {{ error() }}
            </div>
          }

          <app-button
            type="submit"
            [disabled]="loading()"
            class="w-full">
            {{ loading() ? 'Verificando…' : 'Iniciar sesión' }}
          </app-button>
        </form>

        <div class="text-center mt-4">
          <a routerLink="/" class="text-sm text-muted hover:text-primary transition-colors">
            ← Volver al sitio público
          </a>
        </div>

        <p class="text-center text-xs text-muted mt-6 opacity-50">
          Demo: admin / admin123
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  error = signal('');

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { nombre, password } = this.form.getRawValue();
    this.auth.login(nombre, password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales incorrectas. Verifica tu usuario y contraseña.');
      },
    });
  }
}
