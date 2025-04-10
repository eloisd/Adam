import {Topic} from '../models/topic.model';
import {Observable} from 'rxjs';
import {PaginationParams, ResultsPagination} from '../features/query-entity.feature';

export abstract class TopicsGateway {
  abstract getTopics(query: Partial<PaginationParams<Topic>>): Observable<ResultsPagination<Topic>>;
  abstract createTopic(topic: Topic): Observable<void>;
  abstract updateTopic(id: string, topic: Partial<Topic>): Observable<void>;
  abstract deleteTopic(id: string): Observable<void>;
}
