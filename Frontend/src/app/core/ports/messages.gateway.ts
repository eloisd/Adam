import {Observable} from 'rxjs';
import {Message} from '../models/message.model';

export abstract class MessagesGateway {
  abstract getMessageByTopicId(id: number): Observable<Message[]>;
  abstract createMessage(message: Message): Observable<Message>;
}
