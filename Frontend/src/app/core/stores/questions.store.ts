import {patchState, signalStore, withComputed, withHooks, withMethods, withProps} from '@ngrx/signals';
import {
  addEntity,
  removeAllEntities,
  removeEntity,
  setAllEntities,
  setEntities,
  updateEntity,
  withEntities
} from '@ngrx/signals/entities';
import {Question} from '../models/question.model';
import {withSelectedEntity} from '../features/selected-entity.feature';
import {setQueryParams, setQueryTotal, withQueryPaginationEntity} from '../features/query-entity.feature';
import {computed, inject} from '@angular/core';
import {QuestionGateway} from '../ports/question.gateway';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, pipe, subscribeOn, switchMap, tap} from 'rxjs';
import {setError, setPending, setSuccess, withRequestStatus} from '../features/request-status.feature';
import {TopicsStore} from './topics.store';
import {toObservable} from '@angular/core/rxjs-interop';



export const QuestionsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Question>(),
  withRequestStatus(),
  withSelectedEntity(),
  withQueryPaginationEntity<Question>({
    limit: 10,
    offset: 0,
    orderBy: "created_at",
    orderDirection: 'DESC',
  }),
  withComputed((store) => ({
    orderedEntities: computed(() => store.entities().sort((a, b) => a.created_at > b.created_at ? 1 : -1)),
  })),
  withProps((store, topicsStore = inject(TopicsStore)) => ({
    selectedTopic: topicsStore.selectedEntity,
  })),
  withMethods((store, questionGateway = inject(QuestionGateway)) => ({
    continueFetchQuestions: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((topic_id) => questionGateway.getQuestionsByTopicId(topic_id, store.query()).pipe(
          tap((results) => patchState(
            store,
            setEntities(results.items),
            setQueryParams<Question>({
              ...store.query(),
              offset: store.size() + results.items.length
            }),
            setQueryTotal(results.total),
            setSuccess())),
          catchError(async error => patchState(store, setError(error)))
        )),
      )
    ),
    fetchQuestions: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setPending(), setQueryParams({
          limit: 10,
          offset: 0,
          orderBy: "created_at",
          orderDirection: 'DESC',
        }))),
        switchMap((topic_id) => questionGateway.getQuestionsByTopicId(topic_id, store.query()).pipe(
          tap((results) => patchState(
            store,
            setAllEntities(results.items),
            setQueryParams<Question>({
              ...store.query(),
              offset: results.items.length
            }),
            setQueryTotal(results.total),
            setSuccess())),
          catchError(async error => patchState(store, setError(error)))
        )),
      )
    )
  })),
  withHooks((store) => ({
    onInit() {
      const subscription = toObservable(store.selectedTopic).subscribe({
        next: (selectedTopic) => {
          if (selectedTopic) {
            store.fetchQuestions(selectedTopic.id);
          } else {
            patchState(store, removeAllEntities());
          }
        }
      })

      return () => { subscription.unsubscribe() };
    }
  }))
)
