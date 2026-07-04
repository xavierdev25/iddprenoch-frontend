import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas dinámicas con parámetros — server-side rendering
  { path: 'liderazgo/:slug', renderMode: RenderMode.Server },
  // CSR puro: la auth vive en una cookie httpOnly y el authGuard ahora
  // confirma la sesión con una llamada async a GET /auth/me. Se mantiene
  // en el navegador (en vez de RenderMode.Server) para no tener que
  // reenviar manualmente la cookie de la request original durante el SSR.
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Todo lo demás — prerender estático
  { path: '**', renderMode: RenderMode.Prerender },
];
