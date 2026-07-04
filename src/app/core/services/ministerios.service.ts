import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ministerio, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MinisteriosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ministerios`;

  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Ministerio>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Ministerio>>(this.base, { params: httpParams });
  }

  getBySlug(slug: string): Observable<Ministerio> {
    return this.http.get<Ministerio>(`${this.base}/slug/${slug}`);
  }

  getById(id: number): Observable<Ministerio> {
    return this.http.get<Ministerio>(`${this.base}/${id}`);
  }

  create(data: Omit<Ministerio, 'id'>): Observable<Ministerio> {
    return this.http.post<Ministerio>(this.base, data);
  }

  update(id: number, data: Partial<Ministerio>): Observable<Ministerio> {
    return this.http.put<Ministerio>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
