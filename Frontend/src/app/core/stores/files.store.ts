import {patchState, signalStore, withHooks, withMethods, withProps} from '@ngrx/signals';
import {FileModel} from '../models/file.model';
import {
  addEntities,
  removeAllEntities,
  removeEntity,
  setAllEntities,
  setEntities,
  withEntities
} from '@ngrx/signals/entities';
import {setError, setPending, setSuccess, withRequestStatus} from '../features/request-status.feature';
import {withSelectedEntity} from '../features/selected-entity.feature';
import {inject} from '@angular/core';
import {FilesGateway} from '../ports/files.gateway';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, pipe, switchMap, tap} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {TopicsStore} from './topics.store';

export const FilesStore = signalStore(
  { providedIn: 'root' },
  withEntities<FileModel>(),
  withSelectedEntity(),
  withRequestStatus(),
  withProps((store, topicsStore = inject(TopicsStore)) => ({
    selectedTopic: topicsStore.selectedEntity,
  })),
  withMethods((store, filesGateway = inject(FilesGateway)) => ({
    downloadFile: rxMethod<FileModel>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((file) => filesGateway.downloadFile(file).pipe(
          tap(() => patchState(store, setSuccess())),
          catchError(async (error) => patchState(store, setError(error)))
        )),
      )
    ),
    fetchFiles: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((topic_id) => filesGateway.getFilesByTopicId(topic_id).pipe(
          tap((files) => patchState(store, setAllEntities(files), setSuccess())),
          catchError(async (error) => patchState(store, setError(error)))
        )),
      )
    ),
    uploadFiles: (topic_id: string, files: File[], filesModel: FileModel[]) => filesGateway.uploadFiles(topic_id, files, filesModel).pipe(
      tap((savedFiles) => patchState(store, addEntities(savedFiles))),
    ),
    deleteFile: (id: string) => filesGateway.deleteFile(id).pipe(
      tap(() => patchState(store, removeEntity(id))),
    ),
  })),
  withHooks((store) => ({
    onInit() {
      const subscription = toObservable(store.selectedTopic).subscribe({
        next: (selectedTopic) => {
          if (selectedTopic) {
            store.fetchFiles(selectedTopic.id);
          } else {
            patchState(store, removeAllEntities());
          }
        }
      })

      return () => { subscription.unsubscribe() };
    }
  }))
);
