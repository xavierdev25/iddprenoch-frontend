import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Usuario } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/auth`;

  private readonly _user = signal<Usuario | null>(null);

  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly currentUser = this._user.asReadonly();

  /**
   * La cookie httpOnly no se puede leer desde JavaScript, así que no hay forma
   * síncrona de saber si hay sesión activa. Este método consulta al backend
   * y actualiza el signal `currentUser` con el resultado.
   */
  checkAuth(): Observable<boolean> {
    return this.http.get<Usuario>(`${this.base}/me`).pipe(
      tap((user) => this._user.set(user)),
      map(() => true),
      catchError(() => {
        this._user.set(null);
        return of(false);
      }),
    );
  }

  login(nombre: string, password: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.base}/login`, { nombre, password })
      .pipe(tap((user) => this._user.set(user)));
  }

  logout(): void {
    this.http.post(`${this.base}/logout`, {}).subscribe({
      complete: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this._user.set(null);
    void this.router.navigate(['/admin/login']);
  }
}
