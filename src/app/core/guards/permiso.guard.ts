import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Permiso } from '../utils/permisos.util';

/**
 * Evita entrar a una pantalla cuyas llamadas la API va a rechazar con 403. Corre bajo el
 * `authGuard` del shell, que ya cargó el usuario con `/auth/me`.
 */
export function permisoGuard(permiso: Permiso): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    return auth.tienePermiso(permiso) ? true : inject(Router).createUrlTree(['/admin/dashboard']);
  };
}
