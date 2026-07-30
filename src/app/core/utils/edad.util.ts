import { AbstractControl, ValidationErrors } from '@angular/forms';
import { GrupoEtario } from '../models';

/**
 * Edad y grupo etario en el cliente.
 *
 * El backend es la fuente de verdad: es quien calcula el `grupoEtario` que viaja en cada
 * congregante y el que arma los reportes. Lo de aquí sirve para dos cosas de interfaz — mostrar
 * la edad mientras se escribe la fecha en el formulario, y poner nombre a las claves en las
 * pantallas. Los cortes se replican de `iglesia-api/src/utils/edad.ts`: si allá cambian, hay que
 * cambiarlos aquí también.
 */

export const ETIQUETAS_GRUPO_ETARIO: Record<GrupoEtario, string> = {
  nino: 'Niños',
  adolescente: 'Adolescentes',
  joven: 'Jóvenes',
  adulto: 'Adultos',
  sin_fecha: 'Sin fecha de nacimiento',
};

/** Orden en que se muestran los tramos, de menor a mayor edad. */
export const ORDEN_GRUPO_ETARIO: GrupoEtario[] = [
  'nino',
  'adolescente',
  'joven',
  'adulto',
  'sin_fecha',
];

const CORTES: { hasta: number; clave: GrupoEtario }[] = [
  { hasta: 11, clave: 'nino' },
  { hasta: 17, clave: 'adolescente' },
  { hasta: 30, clave: 'joven' },
];

/** Edad cumplida a partir de un `YYYY-MM-DD`, o `undefined` si la fecha falta o es inválida. */
export function edadDeFechaISO(iso: string | undefined | null): number | undefined {
  if (!iso) return undefined;
  const [anio, mes, dia] = iso.split('-').map(Number);
  if (!anio || !mes || !dia) return undefined;

  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) {
    edad -= 1;
  }
  return edad < 0 || edad > 130 ? undefined : edad;
}

export function grupoEtarioDeEdad(edad: number | undefined): GrupoEtario {
  if (edad === undefined) return 'sin_fecha';
  return CORTES.find((c) => edad <= c.hasta)?.clave ?? 'adulto';
}

export function etiquetaGrupoEtario(edad: number | undefined): string {
  return ETIQUETAS_GRUPO_ETARIO[grupoEtarioDeEdad(edad)];
}

/**
 * Rechaza una fecha de nacimiento futura antes de mandarla, para que el error se vea junto al
 * campo en lugar de volver como un 400 genérico del backend (que también la valida).
 */
export function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) return null;
  return new Date(`${valor}T00:00:00`) > new Date() ? { fechaFutura: true } : null;
}
