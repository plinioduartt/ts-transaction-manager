import { Knex, knex } from 'knex'
import { DataSource } from 'typeorm'
import { SupportedOrms, GenericDataSource } from './Interfaces'

/**
 * All the supported ORMs DataSources
 */
export const SupportedDataSources = {
  /**
   * The key and the prototype identification for TypeOrm implementation
   */
  typeorm: DataSource.prototype,
  /**
   * The key and the prototype identification for Knex implementation
   */
  knex: knex.prototype as Knex
} satisfies Record<SupportedOrms, Exclude<GenericDataSource, undefined>>
