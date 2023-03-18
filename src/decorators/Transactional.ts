import pino, { DestinationStream, Logger, LoggerOptions } from 'pino'
import pretty from 'pino-pretty'
import { AvailableDataSources } from '../../src'
import { InvalidDataSourceError } from '../errors'
import { TypeormHandler } from '../handlers'
import {
  DataSourceTypes,
  GenericDataSource,
  OrmHandlerOptions,
  TransactionalOptions
} from '../Interfaces'
import { TransactionManager } from '../TransactionManager'

/**
 * This decorator encapsulates all the method flow inside a transaction that commits in case of success and do rollback in failure cases
 * @param options Receives two optional parameters, dataSource and logging. If dataSource is not given, then it will use the default dataSource
 * @property dataSource ORM DataSource
 * @property logging Default = false
 * @returns
 */
export function Transactional(options?: TransactionalOptions): MethodDecorator {
  const logger: Logger<LoggerOptions | DestinationStream> = pino(
    {
      enabled: options?.logging ?? false
    },
    pretty({
      ignore: 'req,res,pid,hostname,sid,appname,instance,release,ns,headers'
    })
  )

  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    logger.info(
      `[${
        target.constructor.name as string
      }][${propertyKey.toString()}] is being intercepted by Transactional decorator...`
    )

    const originalMethod: any = descriptor.value
    descriptor.value = async function (...args: any) {
      let dataSource: GenericDataSource = TransactionManager.getInstance().getDefaultDataSource()

      if (options?.dataSource) {
        const specificDataSource: Exclude<DataSourceTypes, undefined> = options.dataSource
        dataSource = TransactionManager.getInstance().dataSources.find(
          item => item instanceof AvailableDataSources[specificDataSource].constructor
        )
      }

      if (!dataSource) {
        throw new InvalidDataSourceError(
          `[${
            target.constructor.name as string
          }][${propertyKey.toString()}] Invalid or non-existent DataSource`
        )
      }

      const handlerOptions: OrmHandlerOptions = {
        dataSource,
        target,
        originalMethod,
        propertyKey,
        args,
        context: this,
        logger
      }

      if (TransactionManager.getInstance().isTypeormDataSource(dataSource)) {
        const typeormHandler: TypeormHandler = new TypeormHandler()
        return await typeormHandler.handle(handlerOptions)
      }
    }
    return descriptor
  }
}
