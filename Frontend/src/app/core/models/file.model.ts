import {environment} from '../../../environments/environment';

export class FileModel {
  id: string;
  name: string;
  document_type: string;
  description: string;
  url: string;
  size: number;
  mimetype: string;
  ext: string;
  topic_id: string;
  created_at: string;
  is_ragged: boolean = false;

  constructor(file: File, document_type: string, description: string, topic_id: string) {
    const lastDotIndex = file.name.lastIndexOf(".");

    this.id = crypto.randomUUID();
    this.document_type = document_type;
    this.description = description;
    this.name = file.name.substring(0, lastDotIndex);
    this.url = `${environment.apiUrl}/files/download?id=${this.id}`;
    this.size = file.size;
    this.mimetype = file.type;
    this.ext = file.name.substring(lastDotIndex + 1);
    this.topic_id = topic_id;
    this.created_at = new Date().toISOString();
  }

}
