export class User {
  id: string
  firstname: string
  lastname: string
  email: string
  created_at: string

  constructor(
    firstname: string,
    lastname: string,
    email: string,
  ) {
    this.id = crypto.randomUUID()
    this.firstname = firstname
    this.lastname = lastname
    this.email = email
    this.created_at = new Date().toISOString()
  }
}

export interface UserLogin {
  email: string
  password: string
}

export class UserRegister extends User {
  password: string

  constructor(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
  ) {
    super(firstname, lastname, email)
    this.password = password
  }
}
