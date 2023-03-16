/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata'
import { createMock } from 'ts-auto-mock'
import { DataSource, DataSourceOptions } from 'typeorm'
import { Transactional, TransactionalOptions, TransactionManager } from '../../../../../src'
import { InvalidDataSourceError } from '../../../../../src/errors'
import { TypeormHandler } from '../../../../../src/handlers'
import { HandlerArgs } from '../../../../../src/interfaces'
jest.mock('typeorm', () => {
  const mockClass: jest.MockedClass<any> = jest.fn((...args) => {
    const instance = Object.create(DataSource.prototype)

    return Object.assign(instance, { args })
  })

  return {
    DataSource: mockClass
  }
})

describe('Transactional decorator with typeorm data source', () => {
  const spyTypeormHandler: jest.SpyInstance<Promise<unknown>, [HandlerArgs], any> = jest.spyOn(
    TypeormHandler.prototype,
    'handle'
  )
  const transactionManager: TransactionManager = TransactionManager.getInstance()
  const mockedOptions: DataSourceOptions = createMock<DataSourceOptions>()
  const mockedTypeormDataSource: DataSource = new DataSource(mockedOptions)
  transactionManager
    .addDataSource(mockedTypeormDataSource)
    .setDefaultDataSource(mockedTypeormDataSource)
  const expectedResult = 'test'

  afterEach(() => {
    jest.clearAllMocks()
  })

  const optionsCases: TransactionalOptions[] = [
    undefined as unknown as TransactionalOptions,
    {},
    { logging: true },
    { dataSource: 'typeorm' }
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
      spyTypeormHandler.mockResolvedValue(expectedResult)

      // act
      const result: string = await testingClass.methodToTest()

      // assert
      expect(spyTypeormHandler).toBeCalledTimes(1)
      expect(spyTypeormHandler).toBeCalledWith(
        expect.objectContaining({
          dataSource: mockedTypeormDataSource,
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

  test('Test decorator with invalid data source', async () => {
    // arrange
    class MockedTestingClass {
      @Transactional()
      async methodToTest(): Promise<string> {
        return expectedResult
      }
    }
    const testingClass: MockedTestingClass = new MockedTestingClass()
    spyTypeormHandler.mockResolvedValue(expectedResult)
    jest.spyOn(TransactionManager.prototype, 'getDefaultDataSource').mockReturnValueOnce(undefined)

    // act
    const request = async (): Promise<string> => await testingClass.methodToTest()

    // assert
    await expect(request()).rejects.toThrow(
      new InvalidDataSourceError(
        '[MockedTestingClass][methodToTest] Invalid or non-existent DataSource'
      )
    )
  })
})
