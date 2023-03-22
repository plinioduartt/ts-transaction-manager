export class TransactionManagerException extends Error {
  public name: string
  public status: number
  constructor(message: string) {
    super(message)
    this.name = 'TransactionManagerException'
    this.status = 400
  }
}
