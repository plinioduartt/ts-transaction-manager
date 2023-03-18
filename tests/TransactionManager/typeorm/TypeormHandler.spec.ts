import { createMock } from 'ts-auto-mock'
import { DataSource, QueryRunner } from 'typeorm'
import { IOrmHandler, OrmHandlerOptions } from '../../../src'
import { TypeormHandler } from '../../../src/handlers'

describe('Typeorm handler', () => {
  const sut: IOrmHandler = new TypeormHandler()
  const mockedQueryRunner: QueryRunner = createMock<QueryRunner>({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    release: jest.fn(),
    rollbackTransaction: jest.fn()
  })
  const mockedDataSource: DataSource = createMock<DataSource>({
    createQueryRunner: jest.fn(() => mockedQueryRunner)
  })
  class MockedTestingClass {
    async methodToTest(): Promise<void> {}
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

    // act
    const result: unknown = await sut.handle(args)

    // assert
    expect(result).toBe(expectedResult)
    expect(mockedDataSource.createQueryRunner).toBeCalledTimes(1)
    expect(mockedQueryRunner.connect).toBeCalledTimes(1)
    expect(mockedQueryRunner.startTransaction).toBeCalledTimes(1)
    expect(mockedQueryRunner.commitTransaction).toBeCalledTimes(1)
    expect(mockedQueryRunner.release).toBeCalledTimes(1)
    expect(mockedQueryRunner.rollbackTransaction).toBeCalledTimes(0)
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
    expect(mockedDataSource.createQueryRunner).toBeCalledTimes(1)
    expect(mockedQueryRunner.connect).toBeCalledTimes(1)
    expect(mockedQueryRunner.startTransaction).toBeCalledTimes(1)
    expect(mockedQueryRunner.rollbackTransaction).toBeCalledTimes(1)
    expect(mockedQueryRunner.release).toBeCalledTimes(1)
    expect(mockedQueryRunner.commitTransaction).toBeCalledTimes(0)
  })
})
