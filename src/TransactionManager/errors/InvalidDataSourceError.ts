export class InvalidDataSourceError extends Error {
  public name: string
  public status: number
  constructor(message?: string) {
    super(message ?? 'Invalid or non-existent DataSource')
    this.name = 'InvalidDataSourceError'
    this.status = 400
  }
}
