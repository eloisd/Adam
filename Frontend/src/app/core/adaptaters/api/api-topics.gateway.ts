import {TopicsGateway} from '../../ports/topics.gateway';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Topic} from '../../models/topic.model';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {PaginationParams, ResultsPagination, setHttpParamsQuery} from '../../features/query-entity.feature';

export class ApiTopicsGateway extends TopicsGateway {
  readonly http = inject(HttpClient);

  override createTopic(topic: Topic): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/topics`, topic);
  }

  deleteTopic(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/topics/${id}`);
  }

  getTopics(query: Partial<PaginationParams<Topic>>): Observable<ResultsPagination<Topic>> {
    return this.http.get<ResultsPagination<Topic>>(`${environment.apiUrl}/topics`, {
      params: setHttpParamsQuery(query)
    });
  }

  updateTopic(id: string, topic: Partial<Topic>): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/topics/${topic.id}`, topic);
  }

}
