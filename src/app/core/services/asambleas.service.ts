import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ArchivoDescargado } from './reportes.service';
import {
  Acreditacion,
  Asamblea,
  AsambleaDetalle,
  BusquedaDni,
  CandidatoAdmin,
  Conteo,
  Proclamacion,
  ElectorPadron,
  Paginated,
  TipoAsamblea,
} from '../models';
import { environment } from '../../../environments/environment';

export interface DatosAsamblea {
  nombre: string;
  tipo: TipoAsamblea;
  distritoId: number | null;
  fecha: string;
}

export interface DatosCandidato {
  nombre: string;
  detalle?: string | null;
  foto?: string | null;
  orden?: number;
}

/** Panel de asambleas: todo exige sesión y el permiso "asambleas" (el backend aplica el alcance). */
@Injectable({ providedIn: 'root' })
export class AsambleasService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getAll(page = 1, limit = 50): Observable<Paginated<Asamblea>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<Paginated<Asamblea>>(`${this.api}/asambleas`, { params });
  }

  getById(id: number): Observable<AsambleaDetalle> {
    return this.http.get<AsambleaDetalle>(`${this.api}/asambleas/${id}`);
  }

  create(datos: DatosAsamblea): Observable<Asamblea> {
    return this.http.post<Asamblea>(`${this.api}/asambleas`, datos);
  }

  update(
    id: number,
    datos: Partial<Pick<DatosAsamblea, 'nombre' | 'fecha'>>,
  ): Observable<Asamblea> {
    return this.http.put<Asamblea>(`${this.api}/asambleas/${id}`, datos);
  }

  /** `forzar`: borra también una asamblea con votos (solo el Responsable del sistema; se audita). */
  delete(id: number, forzar = false): Observable<void> {
    return this.http.delete<void>(`${this.api}/asambleas/${id}${forzar ? '?forzar=1' : ''}`);
  }

  crearEleccion(asambleaId: number, cargo: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/asambleas/${asambleaId}/elecciones`, {
      cargo,
    });
  }

  actualizarEleccion(id: number, cargo: string): Observable<unknown> {
    return this.http.put(`${this.api}/elecciones/${id}`, { cargo });
  }

  eliminarEleccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/elecciones/${id}`);
  }

  crearCandidato(eleccionId: number, datos: DatosCandidato): Observable<CandidatoAdmin> {
    return this.http.post<CandidatoAdmin>(`${this.api}/elecciones/${eleccionId}/candidatos`, datos);
  }

  actualizarCandidato(id: number, datos: Partial<DatosCandidato>): Observable<CandidatoAdmin> {
    return this.http.put<CandidatoAdmin>(`${this.api}/candidatos/${id}`, datos);
  }

  eliminarCandidato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/candidatos/${id}`);
  }

  /** Imagen pública y cacheable; 404 si el candidato no tiene foto. */
  fotoCandidatoUrl(id: number): string {
    return `${this.api}/candidatos/${id}/foto`;
  }

  getElectores(
    asambleaId: number,
    q = '',
    page = 1,
    limit = 50,
  ): Observable<Paginated<ElectorPadron>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (q.trim()) params = params.set('q', q.trim());
    return this.http.get<Paginated<ElectorPadron>>(
      `${this.api}/asambleas/${asambleaId}/electores`,
      { params },
    );
  }

  agregarElector(
    asambleaId: number,
    datos: { dni: string; nombre: string; iglesiaId?: number },
  ): Observable<unknown> {
    return this.http.post(`${this.api}/asambleas/${asambleaId}/electores`, datos);
  }

  eliminarElector(asambleaId: number, electorId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/asambleas/${asambleaId}/electores/${electorId}`);
  }

  importarPadron(
    asambleaId: number,
    filtro: { iglesiaId?: number; distritoId?: number; soloBautizados: boolean },
  ): Observable<{ encontrados: number; agregados: number }> {
    return this.http.post<{ encontrados: number; agregados: number }>(
      `${this.api}/asambleas/${asambleaId}/electores/importar`,
      filtro,
    );
  }

  buscarDni(asambleaId: number, dni: string): Observable<BusquedaDni> {
    return this.http.get<BusquedaDni>(`${this.api}/asambleas/${asambleaId}/electores/dni/${dni}`);
  }

  acreditar(asambleaId: number, dni: string, regenerar = false): Observable<Acreditacion> {
    return this.http.post<Acreditacion>(`${this.api}/asambleas/${asambleaId}/acreditar`, {
      dni,
      regenerar,
    });
  }

  // ── Conducción de la votación (Sprint 3) ──

  conteo(eleccionId: number): Observable<Conteo> {
    return this.http.get<Conteo>(`${this.api}/elecciones/${eleccionId}/conteo`);
  }

  abrir(eleccionId: number): Observable<Conteo> {
    return this.http.post<Conteo>(`${this.api}/elecciones/${eleccionId}/abrir`, {});
  }

  cerrar(eleccionId: number): Observable<Conteo> {
    return this.http.post<Conteo>(`${this.api}/elecciones/${eleccionId}/cerrar`, {});
  }

  segundaVuelta(eleccionId: number): Observable<{ id: number; ronda: number }> {
    return this.http.post<{ id: number; ronda: number }>(
      `${this.api}/elecciones/${eleccionId}/segunda-vuelta`,
      {},
    );
  }

  publicar(eleccionId: number): Observable<Proclamacion> {
    return this.http.post<Proclamacion>(`${this.api}/elecciones/${eleccionId}/publicar`, {});
  }

  finalizar(asambleaId: number): Observable<unknown> {
    return this.http.post(`${this.api}/asambleas/${asambleaId}/finalizar`, {});
  }

  /** Por HttpClient (blob) y no por un enlace: así viaja la cookie de sesión (ver reportes.service). */
  descargar(
    asambleaId: number,
    archivo: 'acta.pdf' | 'metricas.csv',
  ): Observable<ArchivoDescargado> {
    return this.http
      .get(`${this.api}/asambleas/${asambleaId}/${archivo}`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(map((r: HttpResponse<Blob>) => ({ blob: r.body!, nombre: nombre(r, archivo) })));
  }
}

function nombre(r: HttpResponse<Blob>, respaldo: string): string {
  return /filename="?([^";]+)"?/.exec(r.headers.get('Content-Disposition') ?? '')?.[1] ?? respaldo;
}
