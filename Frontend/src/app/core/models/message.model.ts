export class Message {
  id: string
  content: string
  author: string
  created_at: string
  topic_id: string
  status: string

  constructor(content: string, author: string, topic_id: string) {
    this.id = crypto.randomUUID()
    this.content = content
    this.author = author
    this.created_at = new Date().toISOString()
    this.topic_id = topic_id
    this.status = 'finished_successfully'
  }
}
