import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Lider, Paginated } from '../models';
import { environment } from '../../../environments/environment';

/** Forma reducida que expone el endpoint público de líderes por ministerio. */
export interface LiderPublico {
  id: number;
  nombre: string;
  apellido: string;
  ministerioId: number;
}

@Injectable({ providedIn: 'root' })
export class LideresService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/lideres`;

  // Nota: GET /api/lideres requiere sesión (expone dni/telefono/correo). Solo
  // se usa desde el panel admin, nunca desde páginas públicas.
  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Lider>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Lider>>(this.base, { params: httpParams });
  }

  getByMinisterio(ministerioId: number): Observable<Lider[]> {
    return this.getAll({ limit: 100 }).pipe(
      map((r) => r.data.filter((l) => l.ministerioId === ministerioId)),
    );
  }

  /**
   * Endpoint público y reducido (sin dni/telefono/correo, sin auth). Es el
   * ÚNICO que debe usarse en la página pública /liderazgo/:slug.
   */
  getPublicByMinisterioSlug(slug: string): Observable<LiderPublico[]> {
    return this.http.get<LiderPublico[]>(
      `${environment.apiUrl}/ministerios/${slug}/lideres-publico`,
    );
  }

  getById(id: number): Observable<Lider> {
    return this.http.get<Lider>(`${this.base}/${id}`);
  }

  create(data: Omit<Lider, 'id'>): Observable<Lider> {
    return this.http.post<Lider>(this.base, data);
  }

  update(id: number, data: Partial<Lider>): Observable<Lider> {
    return this.http.put<Lider>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
