import { Component, computed, input } from '@angular/core';
import qrcode from 'qrcode-generator';

/**
 * QR de ingreso a la votación (/votar/:codigo), para imprimir o proyectar en la asamblea.
 * Se genera en el navegador (qrcode-generator: sin dependencias, ADR-030): no viaja al backend.
 */
@Component({
  selector: 'app-qr-acceso',
  standalone: true,
  template: `
    <div class="flex flex-col items-center gap-3 text-center">
      <img [src]="imagen()" [alt]="'Código QR para ingresar a ' + url()" class="w-64 h-64" />
      <p class="text-sm text-muted break-all">{{ url() }}</p>
      <p class="text-2xl font-semibold tracking-[0.3em] text-foreground">{{ codigo() }}</p>
    </div>
  `,
})
export class QrAccesoComponent {
  codigo = input.required<string>();

  readonly url = computed(() => `${location.origin}/votar/${this.codigo()}`);

  readonly imagen = computed(() => {
    // Nivel de corrección "M": tolera un 15 % de daño (papel arrugado, reflejo en el proyector).
    const qr = qrcode(0, 'M');
    qr.addData(this.url());
    qr.make();
    return qr.createDataURL(8, 2);
  });
}
