import {FilesGateway} from '../../ports/files.gateway';
import {map, Observable, tap} from 'rxjs';
import {FileModel} from '../../models/file.model';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {FileService} from '../../../shared/services/file.service';

export class ApiFilesGateway extends FilesGateway {
  readonly http = inject(HttpClient);
  readonly fileService = inject(FileService);

  override deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/files/${id}`);
  }

  override downloadFile(file: FileModel): Observable<void> {
    return this.http.get(`${environment.apiUrl}/files/download?id=${file.id}`, {responseType: 'blob' }).pipe(
      map(blob => this.fileService.downloadBlob(file, blob))
    )
  }

  override uploadFiles(topic_id: string, files: File[], filesModel: FileModel[]): Observable<FileModel[]> {
    const formData = new FormData();

    files.forEach(file => formData.append('files', file));
    filesModel.forEach(fileModel => formData.append('filesModel', JSON.stringify(fileModel)));

    return this.http.post<FileModel[]>(
      `${environment.apiUrl}/files`,
      formData,
      {
        params: {
          topic_id: topic_id
        },
        headers: {
          'Accept': 'application/json'
        }
      }
    );
  }

  override getFilesByTopicId(topic_id: string): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${environment.apiUrl}/files`, { params: { topic_id: topic_id } });
  }

}
