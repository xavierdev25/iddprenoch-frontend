import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const SITE_URL = 'https://iddprenoch.com';
const DEFAULT_DESCRIPTION =
  'Iglesia de Dios del Perú — Región Norte Chico. Más de 10 congregaciones en Barranca, Huaura y Huaral unidas en fe y servicio.';

// TitleStrategy corre en cada navegación (server y client), así que además del
// <title> nativo de Angular aprovechamos el mismo punto para mantener
// sincronizados meta description, canonical, robots y Open Graph/Twitter con
// la ruta activa, sin tener que llamar a esto manualmente desde cada página.
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) ?? 'IDDP Región Norte Chico';
    this.title.setTitle(pageTitle);

    const description = (this.deepestData(snapshot)?.['description'] as string) ?? DEFAULT_DESCRIPTION;
    const noIndex = Boolean(this.deepestData(snapshot)?.['noIndex']);
    const canonicalUrl = `${SITE_URL}${snapshot.url}`;

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: noIndex ? 'noindex, nofollow' : 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.updateCanonicalLink(canonicalUrl);
  }

  private updateCanonicalLink(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private deepestData(snapshot: RouterStateSnapshot): Record<string, unknown> | undefined {
    let route = snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data;
  }
}
