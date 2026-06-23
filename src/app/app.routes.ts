import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/movies',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  },
  {
    path: 'movies',
    loadComponent: () => import('./features/movies/movie-list/movie-list').then(m => m.MovieList),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/movies'
  }
];
