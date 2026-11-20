import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // GET /auth/me es la propia comprobación de sesión que hacen AuthService
      // y authGuard: un 401 ahí es un resultado esperado (no hay sesión), no
      // una sesión que expiró a mitad de una acción. Dejamos que sea el guard
      // quien decida la redirección (vía UrlTree) para evitar una navegación
      // duplicada a /admin/login.
      const isAuthCheck = req.url.endsWith('/auth/me');
      // Las rutas del elector y de la proyección tienen su propia sesión (o ninguna): un 401 ahí
      // lo resuelve su pantalla, nunca el login del panel.
      const esPublica = req.url.includes('/votacion/') || req.url.includes('/proyeccion/');
      if (error.status === 401 && !isAuthCheck && !esPublica) {
        void router.navigate(['/admin/login']);
      }
      return throwError(() => error);
    }),
  );
};
