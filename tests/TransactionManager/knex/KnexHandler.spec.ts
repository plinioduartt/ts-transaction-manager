import { Knex } from 'knex'
import { createMock } from 'ts-auto-mock'
import { IOrmHandler, OrmHandlerOptions, TransactionManager } from '../../../src'
import { KnexHandler } from '../../../src/handlers'

describe('Knex handler', () => {
  const sut: IOrmHandler = new KnexHandler()
  const mockedDataSource: Knex = createMock<Knex>()
  const mockedTransaction: Knex.Transaction = createMock<Knex.Transaction>()
  mockedTransaction.commit = jest.fn()
  mockedTransaction.rollback = jest.fn()
  const spyTransactionManagerGetKnexTransaction: jest.SpyInstance<Promise<Knex.Transaction>, [], any> =
		jest.spyOn(TransactionManager, 'getKnexTransaction')

  class MockedTestingClass {
    async methodToTest(): Promise<void> { }
  }

  afterEach(() => jest.clearAllMocks())

  test('Transaction commit', async () => {
    // arrange
    const args: OrmHandlerOptions = createMock<OrmHandlerOptions>({
      dataSource: mockedDataSource,
      target: MockedTestingClass.prototype,
      propertyKey: 'methodToTest'
    })
    const expectedResult = 'test'
    args.originalMethod = jest.fn(() => expectedResult)
    spyTransactionManagerGetKnexTransaction.mockResolvedValue(mockedTransaction)

    // act
    const result: unknown = await sut.handle(args)

    // assert
    expect(result).toBe(expectedResult)
    expect(mockedTransaction.commit).toBeCalledTimes(1)
    expect(mockedTransaction.rollback).toBeCalledTimes(0)
  })

  test('Transaction rollback', async () => {
    // arrange
    const args: OrmHandlerOptions = createMock<OrmHandlerOptions>({
      dataSource: mockedDataSource,
      target: MockedTestingClass.prototype,
      propertyKey: 'methodToTest'
    })
    args.originalMethod = jest.fn(() => {
      throw new Error('testing error')
    })

    // act
    const request = async (): Promise<unknown> => await sut.handle(args)

    // assert
    await expect(request()).rejects.toThrow(new Error('testing error'))
    expect(mockedTransaction.rollback).toBeCalledTimes(1)
    expect(mockedTransaction.commit).toBeCalledTimes(0)
  })
})
