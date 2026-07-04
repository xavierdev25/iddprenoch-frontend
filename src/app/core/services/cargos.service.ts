import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cargo, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CargosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cargos`;

  getAll(params?: { page?: number; limit?: number }): Observable<Paginated<Cargo>> {
    const httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    return this.http.get<Paginated<Cargo>>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<Cargo> {
    return this.http.get<Cargo>(`${this.base}/${id}`);
  }
}
