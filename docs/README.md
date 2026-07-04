# Documentación de arquitectura

La documentación de arquitectura (diagramas C4, diagrama entidad-relación, ADRs y anti-patrones evitados) para todo el sistema — backend y frontend — vive en el repositorio `iglesia-api`, en [`docs/`](../../iglesia-api/docs), para no duplicarla entre ambos repos y arriesgar que se desincronice.

Puntos de entrada relevantes para este repo (frontend Angular):

- [Nivel 2 — Contenedores](../../iglesia-api/docs/c4/nivel2-contenedores.md): cómo Apache reparte el tráfico entre el sitio estático y la API.
- [ADR-004 — RenderMode.Client para /admin](../../iglesia-api/docs/adr/adr-004-rendermode-client-admin.md).
- [ADR-005 — Frontend estático puro, en vez de SSR](../../iglesia-api/docs/adr/adr-005-frontend-estatico-vs-ssr.md): la decisión más relevante para este repo, incluye el detalle de `server.ts`, `deploy/start.cjs` y `.htaccess`.
- [ADR-006 — CI/CD por FTP](../../iglesia-api/docs/adr/adr-006-cicd-ftp.md).
