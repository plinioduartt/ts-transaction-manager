import { InvalidDataSourceError } from '../../../TransactionManager/errors'
import { TypeormHandler } from '../../../TransactionManager/handlers'
import { HandlerArgs } from '../../interfaces/IOrmHandler'
import {
  AvailableDataSources,
  DataSourceTypes,
  GenericDataSource
} from '../../interfaces/ITransactionalManager'
import { TransactionManager } from '../../TransactionManager'
import pino, { DestinationStream, Logger, LoggerOptions } from 'pino'
import pretty from 'pino-pretty'

export interface TransactionalOptions {
  dataSource: Exclude<DataSourceTypes, undefined>
  logging?: boolean
}

/**
 * This decorator encapsulates all the method flow inside a transaction that commits in case of success and do rollback in failure cases
 * @param options With two optional parameters, dataSource and logging. If dataSource is not given, then it will use the default dataSource
 * @property dataSource
 * @property logging default = false
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
      }][${propertyKey.toString()}] is being intercepted by Transaction decorator...`
    )

    const originalMethod: any = descriptor.value
    descriptor.value = async function (...args: any) {
      const dataSource: GenericDataSource = options?.dataSource
        ? TransactionManager.getInstance().dataSources.find(
          item => item instanceof AvailableDataSources[options.dataSource].constructor
        )
        : TransactionManager.getInstance().defaultDataSource

      if (dataSource == null) {
        throw new InvalidDataSourceError(
          `[${
            target.constructor.name as string
          }][${propertyKey.toString()}] Invalid or non-existent DataSource`
        )
      }

      const handlerArgs: HandlerArgs = {
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
        return await typeormHandler.handle(handlerArgs)
      }
    }
    return descriptor
  }
}
