import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  // Nota: todo el recurso (incl. GET) requiere sesión en el backend.
  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Usuario>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Usuario>>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  create(data: Omit<Usuario, 'id'> & { password: string }): Observable<Usuario> {
    return this.http.post<Usuario>(this.base, data);
  }

  update(id: number, data: Partial<Usuario> & { password?: string }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
