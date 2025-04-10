import { Routes } from '@angular/router';
import {SignInComponent} from './views/sign-in/sign-in.component';
import {SignUpComponent} from './views/sign-up/sign-up.component';
import {LogoutComponent} from './views/logout/logout.component';
import {HomeComponent} from './views/home/home.component';
import {AuthGuard} from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'signin',
    loadComponent: () => import('./views/sign-in/sign-in.component').then(m => m.SignInComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./views/sign-up/sign-up.component').then(m => m.SignUpComponent)
  },
  {
    path: 'logout',
    loadComponent: () => import('./views/logout/logout.component').then(m => m.LogoutComponent)
  },
  {
    path: '',
    canActivate: [AuthGuard] ,
    loadComponent: () => import('./views/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'topic/:topicid',
    canActivate: [AuthGuard],
    loadComponent: () => import('./views/home/home.component').then(m => m.HomeComponent)
  },
  { path: '**', redirectTo: '' },
];
