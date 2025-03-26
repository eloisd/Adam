import {patchState, signalStore, withMethods} from '@ngrx/signals';
import {FileModel} from '../models/file.model';
import {addEntities, setAllEntities, setEntities, withEntities} from '@ngrx/signals/entities';
import {setError, setPending, setSuccess, withRequestStatus} from '../features/request-status.feature';
import {withSelectedEntity} from '../features/selected-entity.feature';
import {inject} from '@angular/core';
import {FilesGateway} from '../ports/files.gateway';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, pipe, switchMap, tap} from 'rxjs';

export const FilesStore = signalStore(
  { providedIn: 'root' },
  withEntities<FileModel>(),
  withSelectedEntity(),
  withRequestStatus(),
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
    fetchFiles: rxMethod<number>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap((topic_id) => filesGateway.getFilesByTopicId(topic_id).pipe(
          tap((files) => patchState(store, setAllEntities(files), setSuccess())),
          catchError(async (error) => patchState(store, setError(error)))
        )),
      )
    ),
    uploadFile: rxMethod<{ topic_id: number, files: File[] }>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(({ topic_id, files }) => filesGateway.uploadFile(topic_id, files).pipe(
          tap((savedFiles) => patchState(store, addEntities(savedFiles), setSuccess())),
          catchError(async (error) => patchState(store, setError(error)))
        )),
      )
    ),
  }))
);
