import { DataSource } from 'typeorm'

export type DataSourceTypes = 'typeorm'
export type GenericDataSource = DataSource | undefined
export const AvailableDataSources = {
  typeorm: DataSource.prototype
} satisfies Record<DataSourceTypes, Exclude<GenericDataSource, undefined>>
export interface ITransactionManager {
  addDataSource: (dataSource: Exclude<GenericDataSource, undefined>) => ITransactionManager
  setDefaultDataSource: (dataSource: Exclude<GenericDataSource, undefined>) => void
}
