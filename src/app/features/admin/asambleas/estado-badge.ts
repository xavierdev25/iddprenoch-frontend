import { EstadoAsamblea, EstadoEleccion } from '../../../core/models';

type Color = 'green' | 'amber' | 'gray' | 'teal' | 'red' | 'blue';

export const BADGE_ASAMBLEA: Record<EstadoAsamblea, { texto: string; color: Color }> = {
  PROGRAMADA: { texto: 'Programada', color: 'amber' },
  EN_CURSO: { texto: 'En curso', color: 'teal' },
  FINALIZADA: { texto: 'Finalizada', color: 'gray' },
};

export const BADGE_ELECCION: Record<EstadoEleccion, { texto: string; color: Color }> = {
  PENDIENTE: { texto: 'Pendiente', color: 'amber' },
  ABIERTA: { texto: 'Abierta', color: 'teal' },
  CERRADA: { texto: 'Cerrada', color: 'gray' },
};

const FECHA = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeZone: 'America/Lima' });
const HORA = new Intl.DateTimeFormat('es-PE', { timeStyle: 'short', timeZone: 'America/Lima' });

export function formatearFecha(iso: string): string {
  return FECHA.format(new Date(iso));
}

export function formatearHora(iso: string | null): string {
  return iso ? HORA.format(new Date(iso)) : '—';
}
