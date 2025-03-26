import { Injectable } from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {FileModel} from '../../core/models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  downloadBlob(file: FileModel, blob: Blob) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
    document.removeChild(a);
  }
}
