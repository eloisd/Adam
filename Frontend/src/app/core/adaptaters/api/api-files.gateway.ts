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

  deleteFile(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/files/${id}`);
  }

  downloadFile(file: FileModel): Observable<void> {
    return this.http.get(`${environment.apiUrl}/files/download?id=${file.id}`, {responseType: 'blob' }).pipe(
      map(blob => this.fileService.downloadBlob(file, blob))
    )
  }

  uploadFile(topic_id: number, files: File[]): Observable<FileModel[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<FileModel[]>(`${environment.apiUrl}/files`, formData, { params: { topic_id: topic_id } });
  }

  getFilesByTopicId(topic_id: number): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${environment.apiUrl}/files`, { params: { topic_id: topic_id } });
  }

}
