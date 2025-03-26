import {patchState, signalStore, withMethods} from '@ngrx/signals';
import {
  addEntities,
  addEntity,
  removeEntities,
  removeEntity,
  setAllEntities,
  setEntities,
  withEntities
} from '@ngrx/signals/entities';
import {Topic} from '../models/topic.model';
import {withSelectedEntity} from '../features/selected-entity.feature';
import {inject} from '@angular/core';
import {TopicsGateway} from '../ports/topics.gateway';
import {setError, setPending, setSuccess, withRequestStatus} from '../features/request-status.feature';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, pipe, switchMap, tap} from 'rxjs';

export const TopicsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Topic>(),
  withSelectedEntity(),
  withRequestStatus(),
  withMethods((store, topicGateway = inject(TopicsGateway)) => ({
    fetchTopics: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(() => topicGateway.getTopics().pipe(
          tap(topics => patchState(store, setAllEntities(topics), setSuccess())),
          catchError(async error => patchState(store, setError(error)))
        )),
      )
    ),
    createTopic: rxMethod<Topic>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(topic => topicGateway.createTopic(topic).pipe(
          tap(topic => patchState(store, addEntity(topic), setSuccess())),
          catchError(async error => patchState(store, setError(error)))
        )),
      )
    ),
    updateTopic: rxMethod<Topic>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(topic => topicGateway.updateTopic(topic).pipe(
          tap(topic => patchState(store, addEntity(topic), setSuccess())),
          catchError(async error => patchState(store, setError(error)))
        )),
      )
    ),
    deleteTopic: rxMethod<number>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(id => topicGateway.deleteTopic(id).pipe(
          tap(() => patchState(store, removeEntity(id), setSuccess())),
          catchError(async error => patchState(store, setError(error)))
        )),
      )
    )
  }))
)
