import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paginated, RegistroAuditoria } from '../models';
import { environment } from '../../../environments/environment';

export interface FiltrosAuditoria {
  resultado?: 'PERMITIDO' | 'DENEGADO';
  accion?: string;
  /** `YYYY-MM-DD`, inclusive, en hora de Lima. */
  desde?: string;
  hasta?: string;
}

/** Registro de auditoría. Solo lectura y solo para el Responsable del sistema. */
@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auditoria`;

  getAll(
    params: { page: number; limit: number } & FiltrosAuditoria,
  ): Observable<Paginated<RegistroAuditoria>> {
    let httpParams = new HttpParams();
    for (const [clave, valor] of Object.entries(params)) {
      // Un filtro vacío no se envía: el backend lo tomaría como criterio y respondería 400.
      if (valor !== undefined && valor !== '') httpParams = httpParams.set(clave, String(valor));
    }
    return this.http.get<Paginated<RegistroAuditoria>>(this.base, { params: httpParams });
  }
}
