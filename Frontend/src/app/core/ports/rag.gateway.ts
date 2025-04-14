import {Observable} from 'rxjs';

export abstract class RagGateway {
  abstract processFileForRAG(id: string): Observable<void>
}
