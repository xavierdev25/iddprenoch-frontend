import { HttpInterceptorFn } from '@angular/common/http';

// La autenticación viaja en una cookie httpOnly que el backend setea en
// POST /auth/login. El navegador no manda cookies entre orígenes distintos
// (localhost:4200 -> localhost:3000) a menos que la request las pida
// explícitamente, así que clonamos cada request con withCredentials.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
