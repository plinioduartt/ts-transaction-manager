import { DataSource } from 'typeorm'
import { DataSourceTypes, GenericDataSource } from './Interfaces'

/**
 * All the available ORMs DataSources
 */
export const AvailableDataSources = {
  /**
	 * The key and the prototype identification for TypeOrm implementation
	 */
  typeorm: DataSource.prototype
} satisfies Record<DataSourceTypes, Exclude<GenericDataSource, undefined>>
