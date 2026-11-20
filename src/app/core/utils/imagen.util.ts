/**
 * Reduce una imagen en el navegador antes de subirla: el lado mayor queda en `maxLado` px y se
 * re-codifica como JPEG. Para las fotos de candidatos (ADR-029): una foto de celular de 3 MB
 * pasaría a ~40 KB, y al abrirse una elección la piden 200 celulares a la vez.
 */
export async function reducirImagen(
  archivo: File,
  maxLado: number,
  calidad = 0.82,
): Promise<string> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('El navegador no permite procesar imágenes');
  // Fondo blanco: un PNG con transparencia pasado a JPEG quedaría con fondo negro.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', calidad);
}
