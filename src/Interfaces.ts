import { Knex } from 'knex'
import { DestinationStream, Logger, LoggerOptions } from 'pino'
import type { DataSource } from 'typeorm'

/**
 * All the ORMs supported by the lib
 */
export type SupportedOrms = 'typeorm' | 'knex'
/**
 * All the DataSources typings from ORMs
 */
export type GenericDataSource = DataSource | Knex | undefined
/**
 * Interface for Transaction Manager main class, that encapsulates all the initialization and data sources management logic
 */
export interface ITransactionManager {
  /**
	 * This method pushes a new ORM DataSource instance to the Transaction Manager DataSources Array, so you can use this DataSource to manage your transactions
	 * @param dataSource Represents a ORM DataSource instance
	 * @returns Returns the Transaction Manager Instance with only addDataSource and setDefaultDataSource methods
	 */
  addDataSource: (
    dataSource: Exclude<GenericDataSource, undefined>
  ) => Pick<ITransactionManager, 'addDataSource' | 'setDefaultDataSource'>
  /**
	 * This method sets the received DataSource as the default DataSource of the Transaction Manager. At the use, if you dont specify to the Transactional decorator which DataSource to use, it'll use the default DataSource setted by this method.
	 * @param dataSource Represents a ORM DataSource instance
	 * @returns void
	 */
  setDefaultDataSource: (dataSource: Exclude<GenericDataSource, undefined>) => void
  /**
	 * Retrieve the default DataSource instance setted
	 * @returns GenericDataSource
	 */
  getDefaultDataSource: () => GenericDataSource
  /**
	 * This method returns a Knex transaction from a shared Knex provider
	 * @returns
	 */
  getKnexTransaction: () => Promise<Knex.Transaction>
}
/**
 * Interface for OrmHandler class method arguments
 */
export interface OrmHandlerOptions {
  /**
	 * Represents a ORM DataSource instance
	 */
  dataSource: Exclude<GenericDataSource, undefined>
  /**
	 * Represents the target argument of Typescript MethodDecorator
	 */
  target: any
  /**
	 * Represents the originalMethod argument of Typescript MethodDecorator
	 */
  originalMethod: any
  /**
	 * Represents the propertyKey argument of Typescript MethodDecorator
	 */
  propertyKey: string | symbol
  /**
	 * Represents the arguments of descriptor.value from Typescript MethodDecorator arguments
	 */
  args: any
  /**
	 * Represents the context of the method executed and annotated by the Transactional decorator
	 */
  context: PropertyDescriptor
  /**
	 * Represents the logger instance
	 */
  logger: Logger<LoggerOptions | DestinationStream>
}
/**
 * Represents the OrmHandler interface that encapsulates all the ORM transaction implementation logic
 */
export interface IOrmHandler {
  /**
	 * This method encapsulates all the ORM transaction implementation logic
	 * @param options Represents all the options required to handle the transaction - OrmHandlerOptions
	 * @returns Promise<unknown>
	 */
  handle: (options: OrmHandlerOptions) => Promise<unknown>
}
/**
 * Represents the Transactional Decorator options, that customize the execution of the Decorator
 */
export interface TransactionalOptions {
  /**
	 * A string that identifies a specific initilized DataSource at Transaction Manager class
	 * @deprecated **Since v1.0.15**. You should use property **orm** instead **dataSource**
	 */
  dataSource?: SupportedOrms
  /**
	 * A string that identifies a specific initilized DataSource at Transaction Manager class
	 */
  orm: SupportedOrms
  /**
	 * Optional flag to identify if the Decorator needs to log the results.
	 * @defaults true
	 */
  logging?: boolean
}
