import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Evento, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/eventos`;

  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Evento>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Evento>>(this.base, { params: httpParams });
  }

  /**
   * El backend no expone un filtro de "próximos", así que traemos una página
   * amplia y filtramos/ordenamos en el cliente.
   */
  getProximos(limit = 4): Observable<Evento[]> {
    const now = new Date().toISOString();
    return this.getAll({ limit: 100 }).pipe(
      map(r =>
        r.data
          .filter(e => e.fechaConHora >= now)
          .sort((a, b) => a.fechaConHora.localeCompare(b.fechaConHora))
          .slice(0, limit),
      ),
    );
  }

  getById(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.base}/${id}`);
  }

  create(data: Omit<Evento, 'id'>): Observable<Evento> {
    // TEMPORAL: `imagen` puede venir como data URL base64 hasta que exista
    // un endpoint real de subida de archivos.
    return this.http.post<Evento>(this.base, data);
  }

  update(id: number, data: Partial<Evento>): Observable<Evento> {
    return this.http.put<Evento>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
