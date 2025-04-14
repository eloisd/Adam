import {Observable} from 'rxjs';
import {Message} from '../models/message.model';
import {PaginationParams, ResultsPagination} from '../features/query-entity.feature';

export abstract class MessagesGateway {
  abstract getMessageByTopicId(topic_id: string, paginationParams: Partial<PaginationParams<Message>>): Observable<ResultsPagination<Message>>;
}
