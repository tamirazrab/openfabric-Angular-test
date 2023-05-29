import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private accessTokenKey = 'accessToken';
  private accessTokenExpiresKey = 'accessTokenExpires';
  private refreshTokenKey = 'refreshToken';
  private refreshTokenExpiresKey = 'refreshTokenExpires';

  setAccessToken(token: string, expires: string): void {
    localStorage.setItem(this.accessTokenKey, token);
    localStorage.setItem(this.accessTokenExpiresKey, expires.toString());
  }

  setRefreshToken(token: string, expires: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
    localStorage.setItem(this.refreshTokenExpiresKey, expires.toString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.accessTokenExpiresKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.refreshTokenExpiresKey);
  }
}
