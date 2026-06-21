import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly baseUrl = 'https://reqres.in/api';
  private isAuthenticatedSignal = signal<boolean>(this.hasToken());

  isAuthenticated = computed(() => this.isAuthenticatedSignal());

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token') || !!sessionStorage.getItem('token');
  }

  login(credentials: { email: string, password: string }, rememberMe: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email: credentials.email, password: credentials.password }).pipe(
      tap((response: any) => {
        if (response.token) {
          if (rememberMe) {
            localStorage.setItem('token', response.token);
          } else {
             sessionStorage.setItem('token', response.token);
          }
          this.isAuthenticatedSignal.set(true);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    // Reqres just requires email and password for register, so we only pass those
    return this.http.post(`${this.baseUrl}/register`, { email: userData.email, password: userData.password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isAuthenticatedSignal.set(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }
}

