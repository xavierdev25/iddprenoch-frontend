import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Iglesia, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IglesiasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/iglesias`;

  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Iglesia>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Iglesia>>(this.base, { params: httpParams });
  }

  /**
   * El backend no soporta filtrar por distrito vía query param, así que
   * traemos una página amplia y filtramos en el cliente.
   */
  getByDistrito(distritoId: number): Observable<Iglesia[]> {
    return this.getAll({ limit: 100 }).pipe(
      map((r) => r.data.filter((i) => i.distritoId === distritoId)),
    );
  }

  getById(id: number): Observable<Iglesia> {
    return this.http.get<Iglesia>(`${this.base}/${id}`);
  }

  create(data: Omit<Iglesia, 'id'>): Observable<Iglesia> {
    // TEMPORAL: `foto` puede venir como data URL base64 (ImageUploadComponent
    // aún no sube a un storage real). El backend la guarda tal cual como
    // texto; reemplazar cuando exista un endpoint de subida de archivos.
    return this.http.post<Iglesia>(this.base, data);
  }

  update(id: number, data: Partial<Iglesia>): Observable<Iglesia> {
    return this.http.put<Iglesia>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
