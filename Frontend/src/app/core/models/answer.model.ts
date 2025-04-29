export class Answer {
  id: string
  content: string
  is_correct: boolean
  created_at: string

  constructor(content: string, is_correct: boolean) {
    this.id = crypto.randomUUID()
    this.content = content
    this.is_correct = is_correct
    this.created_at = new Date().toISOString()
  }
}

export interface CreateAnswerDto {
  content: string
  isCorrect: boolean
}
