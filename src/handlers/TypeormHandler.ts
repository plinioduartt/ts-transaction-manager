import { IOrmHandler, OrmHandlerOptions } from '../../src/Interfaces'
import { DataSource, QueryRunner } from 'typeorm'

export class TypeormHandler implements IOrmHandler {
  async handle({
    dataSource,
    target,
    originalMethod,
    propertyKey,
    args,
    context,
    logger
  }: OrmHandlerOptions): Promise<unknown> {
    const manager: QueryRunner = (dataSource as DataSource).createQueryRunner()
    await manager.connect()
    await manager.startTransaction()

    logger.info(
      `[${
        target.constructor.name as string
      }][${propertyKey.toString()}][TypeOrm] transaction initialized.`
    )

    try {
      const result: unknown = await originalMethod.apply(context, args)
      await manager.commitTransaction()
      logger.info(
        `[${
          target.constructor.name as string
        }][${propertyKey.toString()}][TypeOrm] transaction completed successfully.`
      )
      return result
    } catch (error: unknown) {
      logger.info(
        `[${
          target.constructor.name as string
        }][${propertyKey.toString()}][TypeOrm] has failed. Rollback realized successfully.`
      )
      await manager.rollbackTransaction()
      throw error
    } finally {
      await manager.release()
    }
  }
}
