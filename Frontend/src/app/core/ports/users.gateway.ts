import {Observable} from 'rxjs';
import {User} from '../models/user.model';

export abstract class UsersGateway {
  abstract updateUser(id: string, user: Partial<User>): Observable<void>;
}
