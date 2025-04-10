import {MessagesGateway} from '../../ports/messages.gateway';
import {Message} from '../../models/message.model';
import {Observable} from 'rxjs';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {PaginationParams, ResultsPagination, setHttpParamsQuery} from '../../features/query-entity.feature';
import {Question} from '../../models/question.model';

export class ApiMessagesGateway extends MessagesGateway {
  readonly http = inject(HttpClient);

  override getMessageByTopicId(topic_id: string, paginationParams: Partial<PaginationParams<Message>>): Observable<ResultsPagination<Message>> {
    return this.http.get<ResultsPagination<Message>>(`${environment.apiUrl}/messages`, {
      params: {
        topic_id: topic_id,
        ...setHttpParamsQuery(paginationParams) }
    });
  }

}
