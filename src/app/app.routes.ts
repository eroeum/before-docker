import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'game/:categoryId',
    loadComponent: () =>
      import('./components/game/game.component').then((m) => m.GameComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
