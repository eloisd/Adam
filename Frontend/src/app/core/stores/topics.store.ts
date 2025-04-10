import {patchState, signalStore, withComputed, withMethods} from '@ngrx/signals';
import {addEntity, removeEntity, setAllEntities, setEntities, updateEntity, withEntities} from '@ngrx/signals/entities';
import {Topic} from '../models/topic.model';
import {withSelectedEntity} from '../features/selected-entity.feature';
import {computed, inject} from '@angular/core';
import {TopicsGateway} from '../ports/topics.gateway';
import {setError, setPending, setSuccess, withRequestStatus} from '../features/request-status.feature';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, pipe, switchMap, tap} from 'rxjs';
import {setQueryParams, setQueryTotal, withQueryPaginationEntity} from '../features/query-entity.feature';
import {GroupTopicsService} from '../../shared/services/group-topics.service';

export const TopicsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Topic>(),
  withSelectedEntity(),
  withRequestStatus(),
  withQueryPaginationEntity({
    limit: 30,
    offset: 0,
    orderBy: 'updated_at',
    orderDirection: 'ASC',
  }),
  withComputed((store) => ({
    orderedEntities: computed(() => store.entities().sort((a, b) => new Date(a.created_at) < new Date(b.created_at) ? 1 : -1)),
  })),
  withComputed((store, groupTopicsService = inject(GroupTopicsService)) => ({
    groupedEntities: computed(() => groupTopicsService.groupTopicsByDate(store.orderedEntities()))
  })),
  withMethods((store, topicGateway = inject(TopicsGateway)) => ({
    continueFetchTopics: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(() => topicGateway.getTopics(store.query()).pipe(
          tap((results) => patchState(
            store,
            setEntities(results.items),
            setQueryParams<Topic>({
              ...store.query(),
              offset: store.size() + results.items.length
            }),
            setQueryTotal(results.total),
            setSuccess())),
          catchError(async error => patchState(store, setError(error)))
        )),
      )
    ),
    fetchTopics: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending(), setQueryParams({
          limit: 30,
          offset: 0,
          orderBy: 'updated_at',
          orderDirection: 'ASC',
        }))),
        switchMap(() => topicGateway.getTopics(store.query()).pipe(
          tap((results) => patchState(
            store,
            setAllEntities(results.items),
            setQueryParams<Topic>({
              ...store.query(),
              offset: results.items.length
            }),
            setQueryTotal(results.total),
            setSuccess())),
          catchError(async error => patchState(store, setError(error)))
        )),
      )
    ),
    addTopic: (topic: Topic) => patchState(store, addEntity(topic)),
    removeTopic: (id: string) => patchState(store, removeEntity(id)),
    createTopic: (topic: Topic) => topicGateway.createTopic(topic).pipe(
      tap(() => patchState(store, addEntity(topic)))
    ),
    updateTopic: (id: string, topic: Partial<Topic>) => topicGateway.updateTopic(id, topic).pipe(
      tap(() => patchState(store, updateEntity({ id: id, changes: topic }))),
    ),
    deleteTopic: (id: string) => topicGateway.deleteTopic(id).pipe(
      tap(() => patchState(store, removeEntity(id))),
    )
  }))
)
