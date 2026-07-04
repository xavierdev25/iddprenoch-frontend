import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';
import { Ministerio, Paginated } from './core/models';

export const serverRoutes: ServerRoute[] = [
  // Ya no hay servidor SSR en producción (sitio estático, ver ADR-005), así
  // que esta ruta se prerenderiza en build igual que el resto del sitio
  // público, en vez de depender de un RenderMode.Server que nadie sirve.
  {
    path: 'liderazgo/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const res = await fetch(`${environment.apiUrl}/ministerios?limit=100`);
      const { data } = (await res.json()) as Paginated<Ministerio>;
      return data.map((m) => ({ slug: m.slug! }));
    },
  },
  // CSR puro: la auth vive en una cookie httpOnly y el authGuard ahora
  // confirma la sesión con una llamada async a GET /auth/me. Se mantiene
  // en el navegador (en vez de RenderMode.Server) para no tener que
  // reenviar manualmente la cookie de la request original durante el SSR.
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Todo lo demás — prerender estático
  { path: '**', renderMode: RenderMode.Prerender },
];
