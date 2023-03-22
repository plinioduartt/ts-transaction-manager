import { Knex } from 'knex'
import { TransactionManager } from '../TransactionManager'
import { IOrmHandler, OrmHandlerOptions } from '../../src/Interfaces'

export class KnexHandler implements IOrmHandler {
  async handle({
    target,
    originalMethod,
    propertyKey,
    args,
    context,
    logger
  }: OrmHandlerOptions): Promise<unknown> {
    const trx: Knex.Transaction<any, any[]> = await TransactionManager.getInstance().getKnexTransaction()

    logger.info(
      `[${
        target.constructor.name as string
      }][${propertyKey.toString()}][Knex] transaction initialized.`
    )

    try {
      const result: unknown = await originalMethod.apply(context, args)
      await trx.commit()
      logger.info(
        `[${
          target.constructor.name as string
        }][${propertyKey.toString()}][Knex] transaction completed successfully.`
      )
      return result
    } catch (error: unknown) {
      logger.info(
        `[${
          target.constructor.name as string
        }][${propertyKey.toString()}][Knex] has failed. Rollback realized successfully.`
      )
      await trx.rollback()
      throw error
    }
  }
}
