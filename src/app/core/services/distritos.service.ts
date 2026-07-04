import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Distrito, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DistritosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/distritos`;

  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Distrito>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Distrito>>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<Distrito> {
    return this.http.get<Distrito>(`${this.base}/${id}`);
  }

  create(data: Omit<Distrito, 'id'>): Observable<Distrito> {
    return this.http.post<Distrito>(this.base, data);
  }

  update(id: number, data: Partial<Distrito>): Observable<Distrito> {
    return this.http.put<Distrito>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
