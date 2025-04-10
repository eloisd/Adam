export class Topic {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string

  constructor(name: string, user_id: string) {
    this.id = crypto.randomUUID()
    this.name = name
    this.user_id = user_id
    this.created_at = new Date().toISOString()
    this.updated_at = new Date().toISOString()
  }
}
