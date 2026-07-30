import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Congregante, CongregantesFiltros, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CongregantesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/congregantes`;

  /**
   * Nota: todo el recurso (incl. GET) requiere sesión en el backend.
   *
   * Los filtros son los mismos que aceptan los reportes, así que la lista en pantalla y el
   * Excel/PDF descargado con los mismos criterios devuelven el mismo conjunto de personas.
   */
  getAll(
    params?: { page?: number; limit?: number } & CongregantesFiltros,
  ): Observable<Paginated<Congregante>> {
    const { page, limit, ...filtros } = params ?? {};
    let httpParams = new HttpParams().set('page', page ?? 1).set('limit', limit ?? 20);
    // Un filtro vacío no se envía: el backend lo tomaría como criterio real y devolvería 400.
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        httpParams = httpParams.set(clave, String(valor));
      }
    }
    return this.http.get<Paginated<Congregante>>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<Congregante> {
    return this.http.get<Congregante>(`${this.base}/${id}`);
  }

  create(data: Omit<Congregante, 'id'>): Observable<Congregante> {
    // TEMPORAL: el form de congregantes incluye `foto` como data URL base64
    // (ImageUploadComponent) aunque no esté en el modelo `Congregante`. Se
    // envía tal cual hasta que exista un endpoint real de subida de archivos.
    return this.http.post<Congregante>(this.base, data);
  }

  update(id: number, data: Partial<Congregante>): Observable<Congregante> {
    return this.http.put<Congregante>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
