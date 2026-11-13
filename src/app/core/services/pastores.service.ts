import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pastor, Paginated } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PastoresService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/pastores`;

  /**
   * `panel: true` pide la vista del panel (`?ambito=panel`): exige sesión y el backend la acota al
   * distrito del obispo distrital e incluye el celular. Sin ella es la vista pública del sitio, completa y
   * anónima. Toda pantalla bajo /admin debe pedir la del panel.
   */
  getAll(params?: {
    page?: number;
    limit?: number;
    panel?: boolean;
  }): Observable<Paginated<Pastor>> {
    let httpParams = new HttpParams()
      .set('page', params?.page ?? 1)
      .set('limit', params?.limit ?? 20);
    if (params?.panel) httpParams = httpParams.set('ambito', 'panel');
    return this.http.get<Paginated<Pastor>>(this.base, { params: httpParams });
  }

  getById(id: number, opciones?: { panel?: boolean }): Observable<Pastor> {
    const params = opciones?.panel ? new HttpParams().set('ambito', 'panel') : undefined;
    return this.http.get<Pastor>(`${this.base}/${id}`, { params });
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
