import {patchState, signalStore, withMethods} from '@ngrx/signals';
import {addEntity, removeEntities, setAllEntities, setEntities, withEntities} from '@ngrx/signals/entities';
import {Message} from '../models/message.model';
import {withSelectedEntity} from '../features/selected-entity.feature';
import {setError, setPending, setSuccess, withRequestStatus} from '../features/request-status.feature';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, pipe, switchMap, tap} from 'rxjs';
import {inject} from '@angular/core';
import {MessagesGateway} from '../ports/messages.gateway';

export const MessagesStore = signalStore(
  { providedIn: 'root' },
  withEntities<Message>(),
  withRequestStatus(),
  withMethods((store, messagesGateway = inject(MessagesGateway)) => ({
    fetchMessages: rxMethod<number>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((id) => messagesGateway.getMessageByTopicId(id).pipe(
          tap((messages) => patchState(store, setAllEntities(messages), setSuccess())),
          catchError(async (error) => patchState(store, setError(error)))
        ))
      )
    ),
    createMessage: rxMethod<Message>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((message) => messagesGateway.createMessage(message).pipe(
          tap((message) => patchState(store, addEntity(message), setSuccess())),
          catchError(async (error) => patchState(store, setError(error)))
        ))
      )
    ),
  }))
)
