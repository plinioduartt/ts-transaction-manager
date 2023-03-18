import { IOrmHandler, OrmHandlerOptions } from '../../src/Interfaces'
import { QueryRunner } from 'typeorm'

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
    const manager: QueryRunner = dataSource.createQueryRunner()
    await manager.connect()
    await manager.startTransaction()

    logger.info(
      `[${
        target.constructor.name as string
      }][${propertyKey.toString()}][Typeorm] transaction initialized.`
    )

    try {
      const result: unknown = await originalMethod.apply(context, args)
      await manager.commitTransaction()
      logger.info(
        `[${
          target.constructor.name as string
        }][${propertyKey.toString()}][Typeorm] transaction completed successfully.`
      )
      return result
    } catch (error: unknown) {
      logger.info(
        `[${
          target.constructor.name as string
        }][${propertyKey.toString()}][Typeorm] has failed. Rollback realized successfully.`
      )
      await manager.rollbackTransaction()
      throw error
    } finally {
      await manager.release()
    }
  }
}
