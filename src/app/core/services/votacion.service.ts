import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cedula, Constancia, EstadoElector, InfoVotacion } from '../models';
import { environment } from '../../../environments/environment';

/**
 * API del elector (/votar/:codigo). Usa su propia cookie de sesión, separada de la del panel
 * (ADR-029); el interceptor de errores no debe mandar a /admin/login por un 401 de aquí.
 */
@Injectable({ providedIn: 'root' })
export class VotacionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/votacion`;

  info(codigo: string): Observable<InfoVotacion> {
    return this.http.get<InfoVotacion>(`${this.base}/${codigo}`);
  }

  ingresar(
    codigo: string,
    dni: string,
    codigoElector: string,
  ): Observable<{ elector: { nombre: string }; asamblea: InfoVotacion }> {
    return this.http.post<{ elector: { nombre: string }; asamblea: InfoVotacion }>(
      `${this.base}/${codigo}/ingresar`,
      {
        dni,
        codigo: codigoElector,
      },
    );
  }

  salir(codigo: string): Observable<unknown> {
    return this.http.post(`${this.base}/${codigo}/salir`, {});
  }

  /** Polling con ETag: el backend responde 304 sin cuerpo si nada cambió (ADR-028). */
  estado(codigo: string, etag: string | null): Observable<HttpResponse<EstadoElector>> {
    return this.http.get<EstadoElector>(`${this.base}/${codigo}/estado`, {
      observe: 'response',
      headers: etag ? { 'If-None-Match': etag } : {},
    });
  }

  cedula(codigo: string): Observable<Cedula> {
    return this.http.get<Cedula>(`${this.base}/${codigo}/cedula`);
  }

  votar(
    codigo: string,
    eleccionId: number,
    candidatoId: number,
  ): Observable<{ constancia: Constancia }> {
    return this.http.post<{ constancia: Constancia }>(`${this.base}/${codigo}/votar`, {
      eleccionId,
      candidatoId,
    });
  }

  fotoCandidatoUrl(id: number): string {
    return `${environment.apiUrl}/candidatos/${id}/foto`;
  }
}
