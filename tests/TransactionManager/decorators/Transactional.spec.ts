/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata'
import { createMock } from 'ts-auto-mock'
import { DataSourceOptions, DataSource } from 'typeorm'
import {
  OrmHandlerOptions,
  Transactional
} from '../../../src'
import { TransactionManagerException } from '../../../src/errors'
import { TypeormHandler } from '../../../src/handlers'
import {
  MainTransactionManager
} from '../../../src/MainTransactionManager'
jest.mock('typeorm', () => {
  const mockClass: jest.MockedClass<any> = jest.fn((...args) => {
    const instance = Object.create(DataSource.prototype)

    return Object.assign(instance, { args })
  })

  return {
    DataSource: mockClass
  }
})

describe('Transactional decorator', () => {
  const spyTypeormHandler: jest.SpyInstance<
  Promise<unknown>,
  [OrmHandlerOptions],
  any
  > = jest.spyOn(TypeormHandler.prototype, 'handle')
  const transactionManager: MainTransactionManager = MainTransactionManager.getInstance()
  const mockedOptions: DataSourceOptions = createMock<DataSourceOptions>()
  const mockedTypeormDataSource: DataSource = new DataSource(mockedOptions)
  transactionManager
    .addDataSource(mockedTypeormDataSource)
    .setDefaultDataSource(mockedTypeormDataSource)
  const expectedResult = 'test'

  test('Test decorator with invalid specific data source', async () => {
    // arrange
    class MockedTestingClass {
      @Transactional()
      async methodToTest(): Promise<string> {
        return expectedResult
      }
    }
    const testingClass: MockedTestingClass = new MockedTestingClass()
    spyTypeormHandler.mockResolvedValue(expectedResult)
    jest.spyOn(MainTransactionManager.prototype, 'getDefaultDataSource')
      .mockReturnValueOnce(undefined)

    // act
    const request = async (): Promise<string> => await testingClass.methodToTest()

    // assert
    await expect(request()).rejects.toThrow(
      new TransactionManagerException(
        '[MockedTestingClass][methodToTest] Invalid or non-existent DataSource'
      )
    )
  })

  test('Test decorator with invalid chosen data source', async () => {
    // arrange
    class MockedTestingClass {
      @Transactional()
      async methodToTest(): Promise<string> {
        return expectedResult
      }
    }
    const testingClass: MockedTestingClass = new MockedTestingClass()
    spyTypeormHandler.mockResolvedValue(expectedResult)
    jest.spyOn(MainTransactionManager.prototype, 'isTypeormDataSource')
      .mockReturnValueOnce(false)
    jest.spyOn(MainTransactionManager.prototype, 'isKnexDataSource')
      .mockReturnValueOnce(false)

    // act
    const request = async (): Promise<string> => await testingClass.methodToTest()

    // assert
    await expect(request()).rejects.toThrow(
      new TransactionManagerException(
        '[Transactional][ChooseHandler] Invalid or non-existent DataSource'
      )
    )
  })
})
