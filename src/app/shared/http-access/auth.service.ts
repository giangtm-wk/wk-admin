import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { APP_CONFIG } from '@config/app.config';
import { jwtDecode } from 'jwt-decode';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private readonly appConfig = inject(APP_CONFIG);
  private readonly http = inject(HttpClient);
  private readonly AUTH_URL = `${this.appConfig.apiUrl}/auth`;
  private accessToken = '';
  private refreshTokenTimeout: any;

  redirectUrl = '/dashboard';

  constructor() {
    // Try to refresh token on app initialization
    this.refreshToken().pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  ngOnDestroy() {
    this.clearRefreshTokenTimer();
  }

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string }>(
      `${this.AUTH_URL}/login`,
      { email, password },
      { withCredentials: true } // Gửi cookie cho refresh
    ).pipe(
      tap(res => this.setSession(res.accessToken))
    );
  }

  logout() {
    return this.http.post(`${this.AUTH_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.accessToken = '';
        this.redirectUrl = '';
        this.clearRefreshTokenTimer();
      })
    );
  }

  refreshToken() {
    return this.http.post<{ accessToken: string }>(
      `${this.AUTH_URL}/refresh-token`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => this.setSession(res.accessToken)),
      map(res => res.accessToken),
    );
  }

  private setSession(accessToken: string): void {
    this.accessToken = accessToken;
    this.setupRefreshTimer(accessToken);
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private setupRefreshTimer(token: string): void {
    const tokenPayload = jwtDecode(token);
    if (!tokenPayload || !tokenPayload.exp) return;
    const expires = new Date(tokenPayload.exp * 1000);
    // Calculate time until token refresh (refresh 1 minute before expiration)
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    // Only set timer if token is not already expired
    if (timeout > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe();
      }, timeout);
    } else {
      // Token is already expired, refresh immediately
      this.refreshToken().subscribe();
    }
  }

  private clearRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
}
