/* eslint-disable @typescript-eslint/no-unused-vars */
import { Knex } from 'knex'
import 'reflect-metadata'
import { createMock } from 'ts-auto-mock'
import { OrmHandlerOptions, Transactional, TransactionalOptions } from '../../../../src'
import { KnexHandler } from '../../../../src/handlers'
import { MainTransactionManager } from '../../../../src/MainTransactionManager'

describe('Transactional decorator with knex data source', () => {
  const spyKnexHandler: jest.SpyInstance<Promise<unknown>, [OrmHandlerOptions], any> = jest.spyOn(
    KnexHandler.prototype,
    'handle'
  )
  const transactionManager: MainTransactionManager = MainTransactionManager.getInstance()
  const mockedDataSource: Knex = Object.create({ name: 'knex', ...createMock<Knex>() })
  transactionManager.addDataSource(mockedDataSource).setDefaultDataSource(mockedDataSource)
  const expectedResult = 'test'

  afterEach(() => {
    jest.clearAllMocks()
  })

  const optionsCases: TransactionalOptions[] = [
    undefined as unknown as TransactionalOptions,
    {} as unknown as TransactionalOptions,
    { logging: true } as unknown as TransactionalOptions,
    { orm: 'knex' }
  ]

  test.each(optionsCases)(
    'Test decorator with different options',
    async (options: TransactionalOptions) => {
      // arrange
      class MockedTestingClass {
        @Transactional(options)
        async methodToTest(): Promise<string> {
          return expectedResult
        }
      }
      const testingClass: MockedTestingClass = new MockedTestingClass()
      spyKnexHandler.mockResolvedValue(expectedResult)

      // act
      const result: string = await testingClass.methodToTest()

      // assert
      expect(spyKnexHandler).toBeCalledTimes(1)
      expect(spyKnexHandler).toBeCalledWith(
        expect.objectContaining({
          dataSource: mockedDataSource,
          target: MockedTestingClass.prototype,
          originalMethod: expect.any(Function),
          propertyKey: 'methodToTest',
          args: expect.any(Array),
          context: expect.any(Object),
          logger: expect.any(Object)
        })
      )
      expect(result).toBe(expectedResult)
    }
  )
})
