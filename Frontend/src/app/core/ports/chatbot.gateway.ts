import {Observable} from 'rxjs';
import {Message} from '../models/message.model';
import {Question} from '../models/question.model';

export abstract class ChatbotGateway {
  abstract chat(message: Message): Observable<{ p?: string, o?: string, v: any }>;
  abstract chatTest(message: Message): Observable<{ message: Message, questions: Question[] }>;
}
