import { Iglesia } from '../models';

/**
 * Enlace a Google Maps para una iglesia (no requiere API key).
 *
 * Prefiere las coordenadas guardadas cuando existen. La búsqueda por nombre y dirección es solo
 * el respaldo para las sedes que todavía no tienen su punto cargado: la mayoría no figura como
 * lugar registrado en Google Maps, así que buscarlas por nombre suele caer en otro sitio o en
 * ninguno. Cargar las coordenadas desde el panel es lo que hace que el enlace sea exacto.
 */
export function googleMapsUrl(
  iglesia: Pick<Iglesia, 'nombre' | 'direccion' | 'latitud' | 'longitud'>,
): string {
  if (iglesia.latitud !== undefined && iglesia.longitud !== undefined) {
    return `https://www.google.com/maps/search/?api=1&query=${iglesia.latitud},${iglesia.longitud}`;
  }
  const query = `${iglesia.nombre}, ${iglesia.direccion}, Perú`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Si el enlace apunta al punto exacto cargado o solo a una búsqueda aproximada por dirección. */
export function tieneUbicacionExacta(iglesia: Pick<Iglesia, 'latitud' | 'longitud'>): boolean {
  return iglesia.latitud !== undefined && iglesia.longitud !== undefined;
}
