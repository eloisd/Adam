import {AuthGateway} from '../../ports/auth.gateway';
import {User, UserLogin, UserRegister} from '../../models/user.model';
import {Observable} from 'rxjs';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

export class ApiAuthGateway extends AuthGateway {
  readonly http = inject(HttpClient);

  override login(user: UserLogin): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/login`, user, { withCredentials: true });
  }

  override register(user: UserRegister): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/register`, user, { withCredentials: true });
  }

  override refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
  }

  override logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true });
  }

  override me(): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/me`, {});
  }
}
