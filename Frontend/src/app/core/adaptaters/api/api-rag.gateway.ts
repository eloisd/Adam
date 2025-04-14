import {RagGateway} from '../../ports/rag.gateway';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';

export class ApiRagGateway extends RagGateway {
  readonly http = inject(HttpClient);

  processFileForRAG(id: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/rag/process/${id}`, {});
  }
}
