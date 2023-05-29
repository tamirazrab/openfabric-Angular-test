import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenStorageService } from './token.service';

import { environment } from '../../environment';

export type User = {
  name: string;
  email: string;
  password: string;
  id?: string;
}

interface AuthResponse {
  user: User;
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private loggedIn$ = new BehaviorSubject<boolean>(false);
  private user$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) { }

  register(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user).pipe(
      tap(response => {
        const { access } = response.tokens;
        const { token, expires } = access;
        this.tokenStorageService.setAccessToken(token, expires);

        this.loggedIn$.next(true);
        this.user$.next(response.user);
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        const { access, refresh } = response.tokens;
        const { token, expires } = access;
        const { token: refreshToken, expires: refreshTokenExpires } = refresh;

        this.tokenStorageService.setAccessToken(token, expires);
        this.tokenStorageService.setRefreshToken(refreshToken, refreshTokenExpires);

        this.loggedIn$.next(true);
        this.user$.next(response.user);
        console.log("🚀 ~ file: auth.service.ts:67 ~ AuthService ~ login ~ response:", response)
      })
    );
  }

  refreshTokens(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-tokens`, { refreshToken }).pipe(
      tap(response => {
        const { access, refresh } = response.tokens;
        const { token, expires } = access;
        const { token: refreshToken, expires: refreshTokenExpires } = refresh;

        this.tokenStorageService.setAccessToken(token, expires);
        this.tokenStorageService.setRefreshToken(refreshToken, refreshTokenExpires);
      })
    );
  }

  logout(): Observable<any> {
    const refreshToken = this.tokenStorageService.getRefreshToken();
    return this.http.post(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => {
        this.loggedIn$.next(false);
        this.tokenStorageService.clearTokens();
      })
    );
  }

  getUser(): Observable<User | null> {
    return this.user$.asObservable();
  }

  getLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  setLoggedIn(value: boolean): void {
    this.loggedIn$.next(value);
  }

  setUser(user: User | null): void {
    this.user$.next(user);
  }
}
