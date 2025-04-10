import {Observable} from 'rxjs';
import {PaginationParams, ResultsPagination} from '../features/query-entity.feature';
import {Question} from '../models/question.model';

export abstract class QuestionGateway {
  abstract getQuestionsByTopicId(topic_id: string, paginationParams: Partial<PaginationParams<Question>>): Observable<ResultsPagination<Question>>;
  abstract getQuestionById(id: string): Observable<Question>;
  abstract deleteQuestion(id: string): Observable<void>;
}
