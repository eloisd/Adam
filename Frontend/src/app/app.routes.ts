import { Routes } from '@angular/router';
import {SignInComponent} from './views/sign-in/sign-in.component';
import {SignUpComponent} from './views/sign-up/sign-up.component';
import {LogoutComponent} from './views/logout/logout.component';
import {HomeComponent} from './views/home/home.component';
import {AuthGuard} from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'topic/:topicid', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];
