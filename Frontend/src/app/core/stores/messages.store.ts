import {patchState, signalStore, withComputed, withHooks, withMethods, withProps} from '@ngrx/signals';
import {
  addEntity,
  removeAllEntities,
  setAllEntities,
  setEntities,
  updateEntity,
  withEntities
} from '@ngrx/signals/entities';
import {Message} from '../models/message.model';
import {setError, setPending, setSuccess, withRequestStatus} from '../features/request-status.feature';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, pipe, switchMap, tap} from 'rxjs';
import {computed, inject} from '@angular/core';
import {MessagesGateway} from '../ports/messages.gateway';
import {setQueryParams, setQueryTotal, withQueryPaginationEntity} from '../features/query-entity.feature';
import {toObservable} from '@angular/core/rxjs-interop';
import {TopicsStore} from './topics.store';
import {ChatbotGateway} from '../ports/chatbot.gateway';

export const MessagesStore = signalStore(
  { providedIn: 'root' },
  withEntities<Message>(),
  withRequestStatus(),
  withQueryPaginationEntity({
    limit: 20,
    offset: 0,
    orderBy: 'created_at',
    orderDirection: 'DESC',
  }),
  withComputed((store) => ({
    orderedEntities: computed(() => store.entities().sort((a, b) => new Date(a.created_at) > new Date(b.created_at) ? 1 : -1)),
  })),
  withProps((store, topicsStore = inject(TopicsStore)) => ({
    selectedTopic: topicsStore.selectedEntity,
    lastP: '',
    lastO: '',
  })),
  withMethods((store) => ({
    getLastBotMessageFromState: () => {
      const botMessages = store.entities().filter((message) => message.author === 'assistant' && message.status === 'in_progress');
      return botMessages[botMessages.length - 1];
    }
  })),
  withMethods((store) => ({
    applyPatch: (patch: { p?: string, o?: string, v: any }) => {
      const { p, o, v } = patch;

      if (p != undefined) {
        store.lastP = p;
      }
      if (o) {
        store.lastO = o;
      }

      if (store.lastP === '' && store.lastO === 'add') {
        // Nouveau message du bot vide, on l’ajoute à l’état
        patchState(store, addEntity(v.message));
      } else if (store.lastP === 'content' && store.lastO === 'append') {
        // On veut ajouter du contenu à un message existant
        const botMessage = store.getLastBotMessageFromState();
        if (botMessage) {
          botMessage.content += v;
          patchState(store, updateEntity({ id: botMessage.id, changes: botMessage }));
        }
      } else if (store.lastP === 'status' && store.lastO === 'replace') {
        // On veut ajouter du contenu à un message existant
        const botMessage = store.getLastBotMessageFromState();
        if (botMessage) {
          botMessage.status = v;
          patchState(store, updateEntity({ id: botMessage.id, changes: botMessage }));
        }
      }
    }
  })),
  withMethods((
    store,
    messagesGateway = inject(MessagesGateway),
    chatbotGateway = inject(ChatbotGateway),
  ) => ({
    fetchMessages: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setPending(), setQueryParams({
          offset: 0,
          limit: 20,
          orderBy: 'created_at',
          orderDirection: 'DESC',
        }))),
        switchMap((id) => messagesGateway.getMessageByTopicId(id, store.query()).pipe(
          tap((results) => patchState(
            store,
            setAllEntities(results.items),
            setSuccess(),
            setQueryParams({
              ...store.query(),
              offset: results.items.length
            }),
            setQueryTotal(results.total)
          )),
          catchError(async (error) => patchState(store, setError(error)))
        ))
      )
    ),
    continueFetchMessages: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((id) => messagesGateway.getMessageByTopicId(id, store.query()).pipe(
          tap((results) => patchState(
            store,
            setEntities(results.items),
            setSuccess(),
            setQueryParams({
              ...store.query(),
              offset: store.size() + results.items.length
            }),
            setQueryTotal(results.total)
          )),
          catchError(async (error) => patchState(store, setError(error)))
        ))
      )
    ),
    sendMessage: (message: string) => {
      const topic_id = store.selectedTopic()?.id;
      if (!topic_id) return;
      const userMessage = new Message(message, 'user', topic_id);
      store.lastP = '';
      store.lastO = '';
      patchState(store, addEntity(userMessage));
      chatbotGateway.chat(userMessage).subscribe({
        next: patch => store.applyPatch(patch)
      })
    },
    sendMessageTest: (message: string) => {
      const topic_id = store.selectedTopic()?.id;
      if (!topic_id) return;
      const userMessage = new Message(message, 'user', topic_id);
      patchState(store, addEntity(userMessage));
      chatbotGateway.chatTest(userMessage).subscribe({
        next: message => patchState(store, addEntity(message)),
      })
    }
  })),
  withHooks((store) => ({
    onInit() {
      const subscription = toObservable(store.selectedTopic).subscribe({
        next: (selectedTopic) => {
          if (selectedTopic) {
            store.fetchMessages(selectedTopic.id);
          } else {
            patchState(store, removeAllEntities());
          }
        }
      })

      return () => { subscription.unsubscribe() };
    }
  }))
)
