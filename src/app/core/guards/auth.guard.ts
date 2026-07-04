import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // La cookie httpOnly no es legible desde el cliente, así que la única forma
  // de confirmar la sesión es preguntarle al backend (GET /auth/me).
  return auth.checkAuth().pipe(map(ok => (ok ? true : router.createUrlTree(['/admin/login']))));
};
