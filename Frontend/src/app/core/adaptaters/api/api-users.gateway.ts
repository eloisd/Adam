import {UsersGateway} from '../../ports/users.gateway';
import {Observable} from 'rxjs';
import {User} from '../../models/user.model';
import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {environment} from '../../../../environments/environment';

export class ApiUsersGateway extends UsersGateway {
  readonly http = inject(HttpClient);

  override updateUser(id: string, user: User): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/api/user/${id}`, user);
  }

}
