import {Topic} from '../models/topic.model';
import {Observable} from 'rxjs';

export abstract class TopicsGateway {
  abstract getTopics(): Observable<Topic[]>;
  abstract getTopicById(id: number): Observable<Topic>;
  abstract createTopic(topic: Topic): Observable<Topic>;
  abstract updateTopic(topic: Topic): Observable<Topic>;
  abstract deleteTopic(id: number): Observable<void>;
}
