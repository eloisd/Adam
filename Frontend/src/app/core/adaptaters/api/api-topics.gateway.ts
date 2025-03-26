import {TopicsGateway} from '../../ports/topics.gateway';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Topic} from '../../models/topic.model';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';

export class ApiTopicsGateway extends TopicsGateway {
  readonly http = inject(HttpClient);

  createTopic(topic: Topic): Observable<Topic> {
    return this.http.post<Topic>(`${environment.apiUrl}/topics`, topic);
  }

  deleteTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/topics/${id}`);
  }

  getTopicById(id: number): Observable<Topic> {
    return this.http.get<Topic>(`${environment.apiUrl}/topics/${id}`);
  }

  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${environment.apiUrl}/topics`);
  }

  updateTopic(topic: Topic): Observable<Topic> {
    return this.http.patch<Topic>(`${environment.apiUrl}/topics/${topic.id}`, topic);
  }

}
