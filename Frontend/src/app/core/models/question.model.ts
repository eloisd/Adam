import {Answer, CreateAnswerDto} from './answer.model';

export class Question {
  id: string
  content: string
  isQCM: boolean
  topic_id: string
  answers: Answer[]
  created_at: string

  constructor(content: string, isQCM: boolean, topic_id: string, answers: Answer[]) {
    this.id = crypto.randomUUID()
    this.content = content
    this.isQCM = isQCM
    this.topic_id = topic_id
    this.answers = answers
    this.created_at = new Date().toISOString()
  }
}
