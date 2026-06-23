import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const usersStorageKey = 'cinetrack_users';

function getStoredUsers(): AuthUser[] {
  const rawUsers = localStorage.getItem(usersStorageKey);

  if (!rawUsers) {
    return [];
  }

  try {
    return JSON.parse(rawUsers) as AuthUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: AuthUser[]): void {
  localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function seedDemoUsers(): void {
  const users = getStoredUsers();
  const demoUser: AuthUser = {
    firstName: 'Eve',
    lastName: 'Holt',
    email: 'eve.holt@reqres.in',
    password: 'Angular1!'
  };

  if (!users.some(user => user.email === demoUser.email)) {
    saveUsers([...users, demoUser]);
  }
}

function generateToken(email: string): string {
  const encodedEmail = typeof btoa === 'function' ? btoa(email) : email;

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `cinetrack-${encodedEmail}-${crypto.randomUUID()}`;
  }

  return `cinetrack-${encodedEmail}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function mockAuthInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (!request.url.endsWith('/api/login') && !request.url.endsWith('/api/register')) {
    return next(request);
  }

  seedDemoUsers();

  if (request.method !== 'POST') {
    return next(request);
  }

  const body = request.body as Partial<AuthUser>;
  const users = getStoredUsers();

  if (request.url.endsWith('/api/login')) {
    const matchedUser = users.find(user => user.email === body.email && user.password === body.password);

    if (!matchedUser) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Invalid email or password' },
        url: request.url,
      }));
    }

    return of(new HttpResponse({
      status: 200,
      body: {
        token: generateToken(matchedUser.email),
        user: {
          firstName: matchedUser.firstName,
          lastName: matchedUser.lastName,
          email: matchedUser.email,
        },
      },
    }));
  }

  const existingUser = users.find(user => user.email === body.email);

  if (existingUser) {
    return throwError(() => new HttpErrorResponse({
      status: 409,
      statusText: 'Conflict',
      error: { message: 'User already exists' },
      url: request.url,
    }));
  }

  const newUser: AuthUser = {
    firstName: body.firstName ?? '',
    lastName: body.lastName ?? '',
    email: body.email ?? '',
    password: body.password ?? '',
  };

  saveUsers([...users, newUser]);

  return of(new HttpResponse({
    status: 200,
    body: {
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    },
  }));
}