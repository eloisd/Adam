export class Answer {
  id: string
  content: string
  isCorrect: boolean
  created_at: string

  constructor(content: string, isCorrect: boolean) {
    this.id = crypto.randomUUID()
    this.content = content
    this.isCorrect = isCorrect
    this.created_at = new Date().toISOString()
  }
}

export interface CreateAnswerDto {
  content: string
  isCorrect: boolean
}
