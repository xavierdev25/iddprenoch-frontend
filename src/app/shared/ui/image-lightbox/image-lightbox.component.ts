import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

/** Click-to-zoom popup for any image on the site, built on top of the shared modal (closes on backdrop click, Escape, or the close button — all handled by app-modal). */
@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal [isOpen]="!!image()" size="lg" (closed)="closed.emit()">
      @if (image(); as img) {
        <img
          [src]="img.src"
          [alt]="img.alt"
          class="w-full max-h-[65vh] object-contain rounded-lg bg-foreground/5"
        />
        @if (img.caption) {
          <p class="text-sm font-medium text-foreground mt-4">{{ img.caption }}</p>
        }
      }
    </app-modal>
  `,
})
export class ImageLightboxComponent {
  image = input<LightboxImage | null>(null);
  closed = output<void>();
}
