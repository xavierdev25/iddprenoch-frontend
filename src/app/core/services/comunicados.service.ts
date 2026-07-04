import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comunicado, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComunicadosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/comunicados`;

  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Comunicado>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Comunicado>>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<Comunicado> {
    return this.http.get<Comunicado>(`${this.base}/${id}`);
  }

  create(data: Omit<Comunicado, 'id'>): Observable<Comunicado> {
    // TEMPORAL: `imagen` puede venir como data URL base64 hasta que exista
    // un endpoint real de subida de archivos.
    return this.http.post<Comunicado>(this.base, data);
  }

  update(id: number, data: Partial<Comunicado>): Observable<Comunicado> {
    return this.http.put<Comunicado>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
