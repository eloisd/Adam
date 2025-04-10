import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, switchMap, throwError} from 'rxjs';
import {AuthStore} from '../../core/stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).accessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);

  if (authStore.isRefreshingToken()) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error?.statusCode === 401 && error.error?.message === 'Unauthorized') {
        authStore.setRefreshingToken(true);

        return authStore.refreshToken().pipe(
          switchMap(({accessToken}) => {
            const clonedRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${accessToken}` },
            });
            authStore.setRefreshingToken(false);
            return next(clonedRequest);
          }),
          catchError(err => {
            authStore.setRefreshingToken(false);
            return throwError(err);
          })
        );
      }
      return throwError(error);
    })
  );
};
