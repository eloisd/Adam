import {Observable} from 'rxjs';
import {User, UserLogin, UserRegister} from '../models/user.model';

export abstract class AuthGateway {
  abstract login(user: UserLogin): Observable<{ accessToken: string }>;
  abstract register(user: UserRegister): Observable<void>;
  abstract refreshToken(): Observable<{ accessToken: string }>;
  abstract me(): Observable<User>;
  abstract logout(): Observable<void>;
}
