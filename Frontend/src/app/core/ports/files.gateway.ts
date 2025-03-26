import {Observable} from 'rxjs';
import {FileModel} from '../models/file.model';

export abstract class FilesGateway {
  abstract uploadFile(topic_id: number, files: File[]): Observable<FileModel[]>;
  abstract downloadFile(file: FileModel): Observable<void>;
  abstract deleteFile(id: number): Observable<void>;
  abstract getFilesByTopicId(topic_id: number): Observable<FileModel[]>;
}
