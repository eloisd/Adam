import {Observable} from 'rxjs';
import {User} from '../models/user.model';

export abstract class UsersGateway {
  abstract updateUser(id: number, user: Partial<User>): Observable<void>;
}
