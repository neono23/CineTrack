import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/movies',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    canActivate: [() => import('./core/guards/guest-guard').then(m => m.guestGuard)]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
    canActivate: [() => import('./core/guards/guest-guard').then(m => m.guestGuard)]
  },
  {
    path: 'movies',
    loadComponent: () => import('./features/movies/movie-list/movie-list').then(m => m.MovieList),
    canActivate: [() => import('./core/guards/auth-guard').then(m => m.authGuard)]
  },
  {
    path: '**',
    redirectTo: '/movies'
  }
];
