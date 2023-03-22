import { knex, Knex } from 'knex'
import { DataSource } from 'typeorm'
import { TransactionManagerException } from './errors'
import { GenericDataSource, ITransactionManager } from './Interfaces'

export class TransactionManager implements ITransactionManager {
  public readonly dataSources: GenericDataSource[] = []
  private _defaultDataSource: GenericDataSource
  private static _instance: TransactionManager | undefined
  private _knexTransactionProvider: Knex.TransactionProvider | undefined

  private constructor() { }

  public addDataSource(
    dataSource: Exclude<GenericDataSource, undefined>
  ): Pick<ITransactionManager, 'addDataSource' | 'setDefaultDataSource'> {
    const dataSourceAlreadyExists: GenericDataSource = this.dataSources.find(
      item => item instanceof dataSource.constructor
    )
    if (dataSourceAlreadyExists) {
      return this
    }
    this.dataSources.push(dataSource)
    return this
  }

  public setDefaultDataSource(dataSource: Exclude<GenericDataSource, undefined>): void {
    const defaultDataSource: GenericDataSource | undefined = this.dataSources.find(
      item => item === dataSource
    )

    if (!defaultDataSource) {
      throw new TransactionManagerException(
        '[TransactionManager][setDefaultDataSource] Invalid or non-existent DataSource'
      )
    }
    this._defaultDataSource = defaultDataSource
  }

  public getDefaultDataSource(): GenericDataSource {
    return this._defaultDataSource
  }

  public static getInstance(): TransactionManager {
    if (!TransactionManager._instance) {
      TransactionManager._instance = new TransactionManager()
    }
    return TransactionManager._instance
  }

  public async getKnexTransaction(): Promise<Knex.Transaction> {
    if (!this._knexTransactionProvider) {
      throw new TransactionManagerException('[TransactionManager][getKnexTransaction] Invalid knexTransactionProvider')
    }

    return await this._knexTransactionProvider()
  }

  public isTypeormDataSource(dataSource: GenericDataSource): dataSource is DataSource {
    return dataSource?.constructor.name === DataSource.prototype.constructor.name
  }

  public isKnexDataSource(dataSource: GenericDataSource): dataSource is Knex {
    this._knexTransactionProvider = (dataSource as Knex).transactionProvider()
    return dataSource?.name === knex.prototype.constructor.name
  }
}
