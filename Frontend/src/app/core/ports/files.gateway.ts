import {Observable} from 'rxjs';
import {FileModel} from '../models/file.model';

export abstract class FilesGateway {
  abstract uploadFiles(topic_id: string, files: File[], filesModel: FileModel[]): Observable<FileModel[]>;
  abstract downloadFile(file: FileModel): Observable<void>;
  abstract deleteFile(id: string): Observable<void>;
  abstract getFilesByTopicId(topic_id: string): Observable<FileModel[]>;
}
