import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pastor, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PastoresService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/pastores`;

  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Pastor>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Pastor>>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<Pastor> {
    return this.http.get<Pastor>(`${this.base}/${id}`);
  }

  create(data: Omit<Pastor, 'id'>): Observable<Pastor> {
    // TEMPORAL: `foto` puede venir como data URL base64 (ver comentario en
    // ImageUploadComponent). Se guarda tal cual hasta que exista upload real.
    return this.http.post<Pastor>(this.base, data);
  }

  update(id: number, data: Partial<Pastor>): Observable<Pastor> {
    return this.http.put<Pastor>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
