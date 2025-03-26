import {Answer} from './answer.model';

export interface Question {
  id: number
  content: string
  isQCM: boolean
  topic_id: number
  answers: Answer[]
}
