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

export interface Congregante {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  iglesiaId: number;
  sexoId: number;
  estadoCivilId: number;
  estadoEclesialId: number;
  fechaConversion?: string;
  fechaBautismo?: string;
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
