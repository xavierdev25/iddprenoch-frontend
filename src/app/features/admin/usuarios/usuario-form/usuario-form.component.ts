import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { DistritosService } from '../../../../core/services/distritos.service';
import { esRolDistrital } from '../../../../core/utils/permisos.util';
import { map } from 'rxjs';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.util';
import { stripEmptyStrings } from '../../../../core/utils/clean-payload.util';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

/** Validador en `confirmarPassword`: lee `password` del hermano vía `control.parent`. Ambos
 * vacíos es válido (modo editar: no cambiar la contraseña); si uno tiene contenido, deben coincidir. */
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;
  const password = (parent.get('password')?.value as string) ?? '';
  const confirmar = (control.value as string) ?? '';
  if (password === '' && confirmar === '') return null;
  return password === confirmar ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, SelectComponent, ButtonComponent],
  template: `
    <div class="max-w-lg">
      <div class="mb-6">
        <a
          routerLink="/admin/usuarios"
          class="text-sm text-muted hover:text-primary transition-colors"
          >← Volver</a
        >
        <h1 class="font-display text-2xl text-foreground mt-2">
          {{ isEditing() ? 'Editar usuario' : 'Nuevo usuario' }}
        </h1>
      </div>
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="bg-surface border border-border rounded-xl p-6 space-y-4"
      >
        <app-input
          label="Nombre completo"
          [control]="form.controls.nombre"
          placeholder="Nombre del usuario"
          [required]="true"
        />
        <app-input
          label="Email"
          [control]="form.controls.email"
          type="email"
          placeholder="usuario@iddp.pe"
        />
        <p class="text-xs text-muted -mb-1">
          El rol define qué puede hacer; el distrito define sobre qué información.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <app-select
            label="Rol"
            [control]="form.controls.rolId"
            [options]="rolOptions()"
            [required]="true"
          />
          @if (esDistrital()) {
            <app-select
              label="Distrito"
              [control]="form.controls.distritoId"
              [options]="distritoOptions()"
              placeholder="Elegir distrito…"
              [required]="true"
            />
          }
        </div>
        @if (esDistrital() && distritoElegido(); as distrito) {
          <div
            class="px-3 py-2.5 rounded bg-secondary/10 border border-secondary/30 text-foreground text-sm"
          >
            Este usuario solo podrá ver y editar la membresía de las iglesias del distrito
            <strong>{{ distrito }}</strong
            >. Cualquier intento de acceder a otro distrito será rechazado y quedará registrado.
          </div>
        }
        <app-select
          label="Estado"
          [control]="form.controls.estadoId"
          [options]="estadoOptions()"
          [required]="true"
        />

        @if (isEditing()) {
          <p class="text-xs text-muted -mb-2">
            Deja estos campos en blanco para no cambiar la contraseña actual.
          </p>
        }
        <app-input
          [label]="isEditing() ? 'Nueva contraseña' : 'Contraseña'"
          [control]="form.controls.password"
          type="password"
          placeholder="••••••••"
          [required]="!isEditing()"
        />
        <app-input
          label="Confirmar contraseña"
          [control]="form.controls.confirmarPassword"
          type="password"
          placeholder="••••••••"
          [required]="!isEditing()"
        />

        @if (error()) {
          <div class="px-3 py-2.5 rounded bg-danger/10 border border-danger/20 text-danger text-sm">
            {{ error() }}
          </div>
        }
        <div class="flex gap-3 pt-2">
          <app-button type="submit" [disabled]="loading()">
            {{ loading() ? 'Guardando…' : isEditing() ? 'Guardar' : 'Crear usuario' }}
          </app-button>
          <a routerLink="/admin/usuarios"
            ><app-button variant="ghost" type="button">Cancelar</app-button></a
          >
        </div>
      </form>
    </div>
  `,
})
export class UsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuariosService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breadcrumb = inject(BreadcrumbService);
  private readonly distritosService = inject(DistritosService);

  isEditing = signal(false);
  loading = signal(false);
  error = signal('');

  // El signal `isEditing` se fija recién en ngOnInit, pero los validadores del form se arman al
  // construirlo (antes de eso). `route` ya está inyectado como campo, así que este booleano plano
  // sí está disponible a tiempo, en el orden de declaración de campos de la clase.
  private readonly isEditingMode = this.route.snapshot.paramMap.get('id') !== null;

  roles = toSignal(this.catalogosService.getRoles(), { initialValue: [] });
  estadosUsuario = toSignal(this.catalogosService.getEstadosUsuario(), { initialValue: [] });

  distritos = toSignal(this.distritosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });

  rolOptions = () => this.roles().map((r) => ({ value: r.id, label: r.nombre }));
  distritoOptions = () => this.distritos().map((d) => ({ value: d.id, label: d.nombre }));
  estadoOptions = () => this.estadosUsuario().map((e) => ({ value: e.id, label: e.nombre }));

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.email]],
    rolId: [0, [Validators.required, Validators.min(1)]],
    estadoId: [1],
    // Obligatorio solo para el Obispo distrital (ver actualizarValidacionDistrito).
    distritoId: [''],
    password: [
      '',
      this.isEditingMode
        ? [Validators.minLength(8)]
        : [Validators.required, Validators.minLength(8)],
    ],
    confirmarPassword: [
      '',
      this.isEditingMode
        ? [Validators.minLength(8), passwordsMatchValidator]
        : [Validators.required, Validators.minLength(8), passwordsMatchValidator],
    ],
  });

  private readonly rolElegido = toSignal(this.form.controls.rolId.valueChanges, {
    initialValue: this.form.controls.rolId.value,
  });
  private readonly distritoIdElegido = toSignal(this.form.controls.distritoId.valueChanges, {
    initialValue: '',
  });

  esDistrital = computed(() =>
    esRolDistrital(this.roles().find((r) => r.id === Number(this.rolElegido()))?.nombre),
  );
  distritoElegido = computed(
    () => this.distritos().find((d) => d.id === Number(this.distritoIdElegido()))?.nombre,
  );

  // El distrito solo se exige cuando el rol es Obispo distrital. Es un effect y no una suscripción
  // al select porque `esDistrital` también depende del catálogo de roles, que llega por HTTP y
  // puede hacerlo después de que se cargó el usuario a editar.
  private readonly validarDistrito = effect(() => {
    const control = this.form.controls.distritoId;
    control.setValidators(this.esDistrital() ? [Validators.required] : []);
    control.updateValueAndValidity();
  });

  ngOnInit(): void {
    // Si `password` cambia después de que el usuario ya llenó `confirmarPassword`, el validador
    // cruzado de este último no se reevalúa solo (Angular solo re-corre validadores del control
    // cuyo propio valor cambió) — sin esto, quedaría "válido" con una contraseña vieja obsoleta.
    this.form.controls.password.valueChanges.subscribe(() => {
      this.form.controls.confirmarPassword.updateValueAndValidity({ onlySelf: true });
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.isEditing.set(true);
      this.service.getById(Number(id)).subscribe((u) => {
        if (u) this.form.patchValue({ ...u, distritoId: u.distritoId ? String(u.distritoId) : '' });
      });
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Usuarios', route: '/admin/usuarios' },
        { label: 'Editar' },
      ]);
    } else {
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Usuarios', route: '/admin/usuarios' },
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
    const { confirmarPassword, ...raw } = this.form.getRawValue();
    const { distritoId, ...resto } = raw;
    const data = {
      ...stripEmptyStrings({
        ...resto,
        rolId: Number(raw.rolId),
        estadoId: Number(raw.estadoId),
      }),
      // `null` explícito: al pasar a un rol regional, el backend quita el distrito anterior.
      distritoId: this.esDistrital() && distritoId ? Number(distritoId) : null,
    };
    const id = this.route.snapshot.paramMap.get('id');
    const op = id !== null ? this.service.update(Number(id), data) : this.service.create(data);
    op.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin/usuarios']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(err));
      },
    });
  }
}
