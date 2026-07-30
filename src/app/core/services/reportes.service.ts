import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Agrupacion, CongregantesFiltros, ReporteMembresia } from '../models';
import { environment } from '../../../environments/environment';

export type FormatoReporte = 'xlsx' | 'pdf';

/** Archivo descargado, con el nombre que propuso el backend. */
export interface ArchivoDescargado {
  blob: Blob;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reportes`;

  private params(filtros: CongregantesFiltros, agruparPor?: Agrupacion): HttpParams {
    let params = new HttpParams();
    // Solo se mandan los filtros con valor: un `''` o un 0 llegarían al backend como filtro real.
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return agruparPor ? params.set('agruparPor', agruparPor) : params;
  }

  /** Consolidado por iglesia o distrito, para mostrarlo en pantalla. */
  getMembresia(filtros: CongregantesFiltros, agruparPor: Agrupacion): Observable<ReporteMembresia> {
    return this.http.get<ReporteMembresia>(`${this.base}/membresia`, {
      params: this.params(filtros, agruparPor),
    });
  }

  /** Consolidado por iglesia/distrito en Excel o PDF. */
  descargarMembresia(
    filtros: CongregantesFiltros,
    agruparPor: Agrupacion,
    formato: FormatoReporte,
  ): Observable<ArchivoDescargado> {
    return this.descargar(`membresia.${formato}`, this.params(filtros, agruparPor));
  }

  /** Listado nominal (una fila por miembro) en Excel o PDF. */
  descargarMiembros(
    filtros: CongregantesFiltros,
    formato: FormatoReporte,
  ): Observable<ArchivoDescargado> {
    return this.descargar(`miembros.${formato}`, this.params(filtros));
  }

  /**
   * La descarga va por HttpClient como blob y no por un `<a href>` directo: la sesión es una
   * cookie httpOnly `SameSite=Lax` y el panel vive en otro origen que la API, así que una
   * navegación directa no la enviaría y el servidor respondería 401. Por HttpClient pasa el
   * interceptor que activa `withCredentials`, y además los errores del backend (por ejemplo un
   * reporte demasiado grande) llegan como HttpErrorResponse en vez de descargarse como archivo.
   */
  private descargar(ruta: string, params: HttpParams): Observable<ArchivoDescargado> {
    return this.http
      .get(`${this.base}/${ruta}`, { params, responseType: 'blob', observe: 'response' })
      .pipe(
        map((respuesta) => ({ blob: respuesta.body!, nombre: nombreDeRespuesta(respuesta, ruta) })),
      );
  }
}

/** Nombre propuesto en Content-Disposition; si el encabezado no llega, la ruta sirve de respaldo. */
function nombreDeRespuesta(respuesta: HttpResponse<Blob>, respaldo: string): string {
  const disposition = respuesta.headers.get('Content-Disposition');
  return /filename="?([^";]+)"?/.exec(disposition ?? '')?.[1] ?? respaldo;
}

/**
 * Dispara la descarga en el navegador a partir del blob ya recibido.
 *
 * El object URL se revoca después de usarlo: cada blob queda retenido en memoria hasta que se
 * libera, y esta pantalla permite descargar muchos reportes seguidos sin recargar.
 */
export function guardarArchivo({ blob, nombre }: ArchivoDescargado): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
