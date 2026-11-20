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

// ── Votación en asambleas (ADR-029) ────────────────────────────────────────────────────────────

export type TipoAsamblea = 'REGIONAL' | 'DISTRITAL';
export type EstadoAsamblea = 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA';
export type EstadoEleccion = 'PENDIENTE' | 'ABIERTA' | 'CERRADA';

export interface Asamblea {
  id: number;
  nombre: string;
  tipo: TipoAsamblea;
  distritoId: number | null;
  distrito: string | null;
  fecha: string;
  codigoAcceso: string;
  estado: EstadoAsamblea;
  /** Solo en el listado. */
  elecciones?: number;
  electores?: number;
}

export interface CandidatoAdmin {
  id: number;
  nombre: string;
  detalle: string | null;
  orden: number;
}

export interface EleccionAdmin {
  id: number;
  cargo: string;
  ronda: number;
  estado: EstadoEleccion;
  abiertaEn: string | null;
  cerradaEn: string | null;
  publicadaEn: string | null;
  ganadorId: number | null;
  ganador: string | null;
  emisiones: number;
  candidatos: CandidatoAdmin[];
}

export interface AsambleaDetalle extends Omit<Asamblea, 'elecciones' | 'electores'> {
  padron: number;
  acreditados: number;
  elecciones: EleccionAdmin[];
}

export interface ElectorPadron {
  id: number;
  dni: string;
  nombre: string;
  iglesia: string | null;
  acreditado: boolean;
  acreditadoEn: string | null;
  votos: number;
}

export interface BusquedaDni {
  enPadron: boolean;
  elector?: {
    id: number;
    dni: string;
    nombre: string;
    acreditado: boolean;
    iglesia: string | null;
  };
  sugerencia?: { dni: string; nombre: string; iglesiaId: number; iglesia: string } | null;
}

export interface Acreditacion {
  elector: { id: number; dni: string; nombre: string };
  /** En claro, una sola vez: la mesa se lo entrega al elector. */
  codigo: string;
  regenerado: boolean;
}

// Vista del elector: nunca trae conteos.
export type EstadoParaElector = 'ESPERA' | 'ABIERTA' | 'FINALIZADA';

export interface InfoVotacion {
  nombre: string;
  estado: EstadoParaElector;
  eleccion: { id: number; cargo: string; ronda: number } | null;
  siguienteCargo: string | null;
}

export interface EstadoElector {
  estado: EstadoParaElector;
  eleccionId: number | null;
  version: number;
  yaVoto: boolean;
}

export interface CandidatoCedula {
  id: number;
  nombre: string;
  detalle: string | null;
  tieneFoto: boolean;
}

export interface Cedula {
  eleccionId: number;
  cargo: string;
  ronda: number;
  yaVoto: boolean;
  candidatos: CandidatoCedula[];
}

export interface Constancia {
  numero: string;
  cargo: string;
  ronda: number;
  emitidoEn: string;
}

export interface ConteoCandidato {
  id: number;
  nombre: string;
  detalle: string | null;
  votos: number;
  porcentaje: number;
}

/** Conteo de una elección: SOLO llega al panel del administrador (REST y Socket.IO). */
export interface Conteo {
  eleccionId: number;
  asambleaId: number;
  cargo: string;
  ronda: number;
  estado: EstadoEleccion;
  ganadorId: number | null;
  publicada: boolean;
  acreditados: number;
  emisiones: number;
  total: number;
  candidatos: ConteoCandidato[];
  empatados: number[];
}

/** Lo único que recibe la proyección: el ganador publicado. */
export interface Proclamacion {
  eleccionId: number;
  cargo: string;
  ronda: number;
  candidato: { id: number; nombre: string; detalle: string | null; tieneFoto: boolean };
  publicadaEn: string;
}
