import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LookupItem } from '../models';
import { environment } from '../../../environments/environment';

/**
 * Catálogos de solo lectura usados para poblar <select> en los formularios de
 * Congregantes y Usuarios. Los 5 endpoints requieren sesión (igual que el
 * resto del panel admin) y devuelven un array plano `{ id, nombre }`.
 */
@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);

  getSexos(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${environment.apiUrl}/sexo`);
  }

  getEstadosCiviles(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${environment.apiUrl}/estado-civil`);
  }

  getEstadosEclesiales(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${environment.apiUrl}/estado-eclesial`);
  }

  getRoles(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${environment.apiUrl}/roles`);
  }

  getEstadosUsuario(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${environment.apiUrl}/estados-usuario`);
  }
}
