import {QuestionGateway} from '../../ports/question.gateway';
import {Question} from '../../models/question.model';
import {Observable} from 'rxjs';
import {PaginationParams, ResultsPagination, setHttpParamsQuery} from '../../features/query-entity.feature';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

export class ApiQuestionGateway extends QuestionGateway {
  readonly http = inject(HttpClient);

  override deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/questions/${id}`);
  }

  override getQuestionById(id: string): Observable<Question> {
    return this.http.get<Question>(`${environment.apiUrl}/api/questions/${id}`);
  }

  override getQuestionsByTopicId(topic_id: string, paginationParams: Partial<PaginationParams<Question>>): Observable<ResultsPagination<Question>> {
    return this.http.get<ResultsPagination<Question>>(`${environment.apiUrl}/api/questions`, {
      params: {
        topic_id: topic_id,
        ...setHttpParamsQuery(paginationParams)
      }
    })
  }

}
