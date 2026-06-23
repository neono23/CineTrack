import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: Omit<AuthUser, 'password'>;
}

interface ReqresRecord {
  id: string;
  data: AuthUser & { role?: string };
}

interface ReqresCollectionResponse {
  data: ReqresRecord[];
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly baseUrl = 'https://reqres.in/api/collections/users/records';
  private readonly projectId = '32193';
  private readonly apiKey = 'pro_3f66925288d461bfba2929667d0666a53bb2a4828d36fec53e4c33f39b72b31e';
  private readonly apiEnv = 'prod';
  private isAuthenticatedSignal = signal<boolean>(this.hasToken());

  isAuthenticated = computed(() => this.isAuthenticatedSignal());

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token') || !!sessionStorage.getItem('token');
  }

  private buildHeaders() {
    return {
      'x-api-key': this.apiKey,
      'X-Reqres-Env': this.apiEnv,
    };
  }

  private generateToken(email: string): string {
    const encodedEmail = typeof btoa === 'function' ? btoa(email) : email;

    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `cinetrack-${encodedEmail}-${crypto.randomUUID()}`;
    }

    return `cinetrack-${encodedEmail}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  login(credentials: { email: string, password: string }, rememberMe: boolean): Observable<any> {
    return this.http.get<ReqresCollectionResponse>(`${this.baseUrl}?project_id=${this.projectId}`, {
      headers: this.buildHeaders(),
    }).pipe(
      map((response) => response.data.find(record => record.data.email === credentials.email && record.data.password === credentials.password)),
      switchMap((matchedRecord) => {
        if (!matchedRecord) {
          return throwError(() => new Error('Invalid email or password'));
        }

        const authResponse: AuthResponse = {
          token: this.generateToken(matchedRecord.data.email),
          user: {
            firstName: matchedRecord.data.firstName,
            lastName: matchedRecord.data.lastName,
            email: matchedRecord.data.email,
          },
        };

        return of(authResponse);
      }),
      tap((authResponse) => {
        if (rememberMe) {
          localStorage.setItem('token', authResponse.token);
        } else {
          sessionStorage.setItem('token', authResponse.token);
        }

        this.isAuthenticatedSignal.set(true);
      })
    );
  }

  register(userData: any): Observable<any> {
    const payload = {
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: 'user',
      },
    };

    return this.http.post(`${this.baseUrl}?project_id=${this.projectId}`, payload, {
      headers: this.buildHeaders(),
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }
}

