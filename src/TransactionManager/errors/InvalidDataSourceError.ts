export class InvalidDataSourceError extends Error {
  public name: string
  public status: number
  constructor(message: string) {
    super(message)
    this.name = 'InvalidDataSourceError'
    this.status = 400
  }
}
