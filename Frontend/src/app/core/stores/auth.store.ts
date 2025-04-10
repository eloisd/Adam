import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {setError, setPending, setSuccess, withRequestStatus} from '../features/request-status.feature';
import {computed, inject} from '@angular/core';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, exhaustMap, pipe, switchMap, tap, throwError} from 'rxjs';
import {AuthGateway} from '../ports/auth.gateway';
import {User, UserLogin, UserRegister} from '../models/user.model';
import {UsersGateway} from '../ports/users.gateway';

type AuthState = {
  accessToken: string | null;
  user: User | null;
  isRefreshingToken: boolean;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({ accessToken: null, user: null, isRefreshingToken: false }),
  withRequestStatus(),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.accessToken()),
    fullname: computed(() => store.user()?.firstname + ' ' + store.user()?.lastname)
  })),
  withMethods((store, authGateway = inject(AuthGateway), userGateway = inject(UsersGateway)) => ({
    login: rxMethod<UserLogin>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((userLogin) =>
          authGateway.login(userLogin).pipe(
            tap((res) => patchState(store, { accessToken: res.accessToken })),
            switchMap(() => authGateway.me()),
            tap((user) => patchState(store, { user }, setSuccess())),
            catchError(async (err) => patchState(store, setError(err?.error?.message)))
          )
        )
      )
    ),
    register: (userRegister: UserRegister) => authGateway.register(userRegister),
    refreshToken: () => authGateway.refreshToken().pipe(
      tap((res) => patchState(store, {accessToken: res.accessToken}))
    ),
    logout: () => authGateway.logout().pipe(
      tap(() => patchState(store, {accessToken: null, user: null}))
    ),
    me: () => authGateway.me().pipe(
      tap((user) => patchState(store, {user}))
    ),
    update: (user: Omit<User, 'id'>) => {
      patchState(store, setPending());
      const id: string = store.user()?.id || '';
      return userGateway.updateUser(id, user).pipe(
        tap(() => patchState(store, {user: { ...user, id: id }}, setSuccess())),
        catchError(async (err) => patchState(store, setError(err?.error?.message)))
      )
    },
    setRefreshingToken: (isRefreshing: boolean) => patchState(store, {isRefreshingToken: isRefreshing}),
  }))
)
