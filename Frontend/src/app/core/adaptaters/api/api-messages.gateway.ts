import {MessagesGateway} from '../../ports/messages.gateway';
import {Message} from '../../models/message.model';
import {Observable} from 'rxjs';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

export class ApiMessagesGateway extends MessagesGateway {
  readonly http = inject(HttpClient);

  createMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(`${environment.apiUrl}/messages`, message);
  }

  getMessageByTopicId(id: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/messages`, { params: { topic_id: id } });
  }

}
