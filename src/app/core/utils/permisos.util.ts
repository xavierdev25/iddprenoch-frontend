/**
 * Copia de la matriz de permisos del backend (src/utils/permisos.ts, ADR-026), solo para decidir
 * qué menús y botones mostrar. No protege nada: quien decide es la API, que responde 403 a todo lo
 * que este archivo pudiera dejar ver por error. Si cambia allá, hay que cambiarla aquí.
 */
export const ROLES = {
  RESPONSABLE: 'Responsable del sistema',
  OBISPO_REGIONAL: 'Obispo regional',
  OBISPO_DISTRITAL: 'Obispo distrital',
  EDITOR: 'Editor',
} as const;

export type Permiso =
  'usuarios' | 'auditoria' | 'membresia' | 'iglesias' | 'organizacion' | 'contenido' | 'asambleas';

const PERMISOS_POR_ROL: Record<string, readonly Permiso[]> = {
  [ROLES.RESPONSABLE]: [
    'usuarios',
    'auditoria',
    'membresia',
    'iglesias',
    'organizacion',
    'contenido',
    'asambleas',
  ],
  [ROLES.OBISPO_REGIONAL]: ['membresia', 'iglesias', 'organizacion', 'contenido', 'asambleas'],
  [ROLES.OBISPO_DISTRITAL]: ['membresia', 'iglesias', 'asambleas'],
  [ROLES.EDITOR]: ['contenido'],
};

export function permisosDe(rol: string | undefined): readonly Permiso[] {
  return rol ? (PERMISOS_POR_ROL[rol] ?? []) : [];
}

export function esRolDistrital(rol: string | undefined): boolean {
  return rol === ROLES.OBISPO_DISTRITAL;
}
