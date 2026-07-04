import { Iglesia } from '../models';

/**
 * Google Maps search URL (no API key required) for a given iglesia.
 * Includes the church name alongside the address so Google can locate it
 * even when the address alone is too sparse (e.g. just "Huayto").
 */
export function googleMapsUrl(iglesia: Pick<Iglesia, 'nombre' | 'direccion'>): string {
  const query = `${iglesia.nombre}, ${iglesia.direccion}, Perú`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
