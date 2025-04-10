import {Observable} from 'rxjs';
import {Message} from '../models/message.model';

export abstract class ChatbotGateway {
  abstract chat(message: Message): Observable<{ p?: string, o?: string, v: any }>;
}
