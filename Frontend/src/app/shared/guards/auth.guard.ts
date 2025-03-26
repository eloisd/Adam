// auth.guard.ts
import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthStore} from '../../core/stores/auth.store';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  readonly authStore = inject(AuthStore);

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authStore.isAuthenticated()) return true;

    return new Observable<boolean>((observer) => {
      this.authStore.me().subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          localStorage.setItem('redirectTo', state.url);
          this.router.navigate(['signin']);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
