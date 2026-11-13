export interface Distrito {
  id: number;
  nombre: string;
}

export interface Cargo {
  id: number;
  nombre: string;
}

export interface Iglesia {
  id: number;
  nombre: string;
  direccion: string;
  distritoId: number;
  ministerioId?: number;
  foto?: string;
  /** Punto exacto de la sede. La mayoría no figura como lugar en Google Maps. */
  latitud?: number;
  longitud?: number;
  /**
   * Enlace al mapa. De solo lectura: el backend lo deriva de las coordenadas. Al guardar se puede
   * mandar en su lugar la URL de Google Maps pegada, y el backend extrae de ahí lat/lng.
   */
  mapsUrl?: string;
}

export interface Pastor {
  id: number;
  iglesiaId: number;
  nombrePastor: string;
  celular?: string;
  cargoId: number;
  distritoId?: number;
  foto?: string;
}

export interface Lider {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  ministerioId: number;
  iglesiaId: number;
}

export interface Ministerio {
  id: number;
  nombre: string;
  descripcion?: string;
  slug?: string;
}

/** Tramos de edad del reporte de membresía. `sin_fecha` = aún sin fecha de nacimiento cargada. */
export type GrupoEtario = 'nino' | 'adolescente' | 'joven' | 'adulto' | 'sin_fecha';

export interface Congregante {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  fechaNacimiento?: string;
  /** Derivados de `fechaNacimiento` por el backend; no se envían al guardar. */
  edad?: number;
  grupoEtario?: GrupoEtario;
  iglesiaId: number;
  /** Ministerio en el que participa. Opcional. */
  ministerioId?: number;
  sexoId: number;
  estadoCivilId: number;
  estadoEclesialId: number;
  fechaConversion?: string;
  fechaBautismo?: string;
}

/** Filtros compartidos por el listado de congregantes y los reportes. */
export interface CongregantesFiltros {
  iglesiaId?: number;
  distritoId?: number;
  ministerioId?: number;
  sexoId?: number;
  estadoCivilId?: number;
  estadoEclesialId?: number;
  grupoEtario?: GrupoEtario;
  q?: string;
}

export interface Evento {
  id: number;
  nombre: string;
  fechaConHora: string;
  ubicacion?: string;
  descripcion?: string;
  imagen?: string;
}

export interface Comunicado {
  id: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  rolId: number;
  email?: string;
  estadoId: number;
  /** Solo el Obispo distrital tiene distrito; los roles regionales lo tienen en `null`. */
  distritoId?: number | null;
  /** Nombre del rol. Lo devuelven `/auth/login` y `/auth/me` (no el listado de usuarios). */
  rol?: string;
}

/** Fila del registro de auditoría (solo la consulta el Responsable del sistema). */
export interface RegistroAuditoria {
  id: number;
  fecha: string;
  usuarioId?: number;
  usuarioNombre?: string;
  accion: string;
  recurso: string;
  resultado: 'PERMITIDO' | 'DENEGADO';
  detalle?: string;
  ip?: string;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface LookupItem {
  id: number;
  nombre: string;
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

/** Forma de respuesta de los endpoints de listado paginados del backend. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Reportes de membresía ──────────────────────────────────────────────────────

export type Agrupacion = 'iglesia' | 'distrito';

/** Conteos de un grupo. Las claves de `porSexo`/`porEstadoEclesial` son nombres del catálogo. */
export interface Conteos {
  total: number;
  porSexo: Record<string, number>;
  porGrupoEtario: Record<GrupoEtario, number>;
  porEstadoEclesial: Record<string, number>;
}

export interface FilaConsolidado extends Conteos {
  id: number;
  nombre: string;
  /** Solo presente al agrupar por iglesia. */
  distrito?: string;
}

/** Filtro activo ya resuelto a texto por el backend, para mostrarlo en pantalla y en el archivo. */
export interface FiltroAplicado {
  etiqueta: string;
  valor: string;
}

export interface ReporteMembresia {
  generadoEn: string;
  agruparPor: Agrupacion;
  filtros: FiltroAplicado[];
  /** Nombres de catálogo que definen las columnas variables del reporte. */
  columnasSexo: string[];
  columnasEstadoEclesial: string[];
  filas: FilaConsolidado[];
  totales: Conteos;
}
