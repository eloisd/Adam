import {patchState, signalStoreFeature, withComputed, withMethods, withProps, withState} from '@ngrx/signals';
import {computed} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';

export type RequestStatus = 'idle' | 'pending' | 'success' | { error: string };

export type RequestStatusState = { requestStatus: RequestStatus };

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({ requestStatus: 'idle' }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      isSuccess: computed(() => requestStatus() === 'success'),
      error: computed(() => {
        const status = requestStatus();
        return typeof status === 'object' ? status.error : null;
      }),
    })),
    withProps((store) => ({
      isPending$: toObservable(store.isPending),
      isSuccess$: toObservable(store.isSuccess),
      error$: toObservable(store.error),
    })),
    withMethods((store) => ({
      setRequestStatus: (status: RequestStatus) => patchState(store, { requestStatus: status }),
    }))
  )
}

export function setPending(): RequestStatusState {
  return { requestStatus: 'pending' };
}

export function setSuccess(): RequestStatusState {
  return { requestStatus: 'success' };
}

export function setIdle(): RequestStatusState {
  return { requestStatus: 'idle' };
}

export function setError(error: string): RequestStatusState {
  return { requestStatus: { error } };
}
