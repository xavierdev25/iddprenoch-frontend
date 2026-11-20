import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { Conteo, Proclamacion } from '../models';
import { environment } from '../../../environments/environment';

export type EventoPanel =
  | { tipo: 'conteo'; conteo: Conteo }
  | { tipo: 'cambio' }
  | { tipo: 'conexion'; conectado: boolean }
  | { tipo: 'error'; error: string };

/**
 * Socket.IO del panel y de la proyección (ADR-028). Solo long polling: el hosting no deja pasar
 * WebSocket, así que ni se intenta. Cada suscripción abre su conexión y la cierra al terminar;
 * al reconectarse, vuelve a unirse a su sala sola.
 */
@Injectable({ providedIn: 'root' })
export class TiempoRealService {
  private readonly http = inject(HttpClient);
  private readonly origen = new URL(environment.apiUrl).origin;

  private socket() {
    return io(this.origen, {
      path: '/api/socket.io',
      transports: ['polling'],
      withCredentials: true,
    });
  }

  /** Sala admin:{id}: conteo en vivo y avisos de cambio de estado. Exige sesión del panel. */
  panel(asambleaId: number): Observable<EventoPanel> {
    return new Observable<EventoPanel>((sub) => {
      const s = this.socket();
      const unirse = () =>
        s.emit('admin:unirse', { asambleaId }, (r: { ok: boolean; error?: string }) => {
          sub.next(
            r.ok
              ? { tipo: 'conexion', conectado: true }
              : { tipo: 'error', error: r.error ?? 'Sin acceso' },
          );
        });
      s.on('connect', unirse);
      s.on('disconnect', () => sub.next({ tipo: 'conexion', conectado: false }));
      s.on('conteo:actualizado', (conteo: Conteo) => sub.next({ tipo: 'conteo', conteo }));
      s.on('asamblea:cambio', () => sub.next({ tipo: 'cambio' }));
      return () => s.close();
    });
  }

  /** Sala proyeccion:{id}: solo el ganador publicado. Pública. */
  proyeccion(codigo: string): Observable<Proclamacion> {
    return new Observable<Proclamacion>((sub) => {
      const s = this.socket();
      s.on('connect', () => s.emit('proyeccion:unirse', { codigo }));
      s.on('ganador:proclamado', (p: Proclamacion) => sub.next(p));
      return () => s.close();
    });
  }

  /** Estado inicial de la proyección y respaldo si el socket se corta: el último ganador publicado. */
  estadoProyeccion(
    codigo: string,
  ): Observable<{ asamblea: { nombre: string; estado: string }; proclamado: Proclamacion | null }> {
    return this.http.get<{
      asamblea: { nombre: string; estado: string };
      proclamado: Proclamacion | null;
    }>(`${environment.apiUrl}/proyeccion/${codigo}`);
  }
}
