import { knex, Knex } from 'knex'
import { DataSource } from 'typeorm'
import { TransactionManagerException } from './errors'
import { GenericDataSource, ITransactionManager } from './Interfaces'

export class MainTransactionManager implements ITransactionManager {
  private static _instance: MainTransactionManager | undefined
  public readonly dataSources: Array<Exclude<GenericDataSource, undefined>> = []
  private _defaultDataSource: GenericDataSource
  private _knexTransactionProvider: Knex.TransactionProvider | undefined

  private constructor() {}

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

  public static getInstance(): MainTransactionManager {
    if (!MainTransactionManager._instance) {
      MainTransactionManager._instance = new MainTransactionManager()
    }
    return MainTransactionManager._instance
  }

  public getKnexTransactionProvider(): Knex.TransactionProvider | undefined {
    return this._knexTransactionProvider
  }

  public async getKnexTransaction(): Promise<Knex.Transaction> {
    const transactionProvider: Knex.TransactionProvider | undefined =
      this.getKnexTransactionProvider()
    if (!transactionProvider) {
      throw new TransactionManagerException(
        '[TransactionManager][getKnexTransaction] Invalid knexTransactionProvider'
      )
    }

    return await transactionProvider()
  }

  public isTypeormDataSource(
    dataSource: Exclude<GenericDataSource, undefined>
  ): dataSource is DataSource {
    return dataSource.constructor.name === DataSource.prototype.constructor.name
  }

  public isKnexDataSource(dataSource: Exclude<GenericDataSource, undefined>): dataSource is Knex {
    this._knexTransactionProvider = (dataSource as Knex).transactionProvider()
    return dataSource.name === knex.prototype.constructor.name
  }
}
