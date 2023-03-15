import 'reflect-metadata'
import { GenericDataSource, ITransactionManager, TransactionManager, InvalidDataSourceError } from '../../src/TransactionManager'
import { DataSource, DataSourceOptions } from 'typeorm'
import { createMock } from 'ts-auto-mock'
jest.mock('typeorm', () => {
  const mockClass: jest.MockedClass<any> = jest.fn((...args) => {
    const instance = Object.create(DataSource.prototype)

    return Object.assign(instance, { args })
  })

  return {
    DataSource: mockClass
  }
})

describe('TransactionManager', () => {
  const mockedTypeormDataSource: DataSource = createMock<DataSource>()

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Add unique data sources', () => {
    // arrange
    const sut: TransactionManager = Reflect.construct(TransactionManager, [])
    const spyAddDataSource: jest.SpyInstance<ITransactionManager, [dataSource: DataSource], any> =
			jest.spyOn(sut, 'addDataSource')

    // act
    sut
      .addDataSource(mockedTypeormDataSource)
      .addDataSource(mockedTypeormDataSource)
      .addDataSource(mockedTypeormDataSource)

    // assert
    expect(sut.dataSources.length).toBe(1)
    expect(spyAddDataSource).toHaveBeenCalledTimes(3)
  })

  test('Set default data source', () => {
    // arrange
    const sut: TransactionManager = Reflect.construct(TransactionManager, [])
    const spySetDefaultDataSource = jest.spyOn(sut, 'setDefaultDataSource')

    // act
    sut
      .addDataSource(mockedTypeormDataSource)
      .setDefaultDataSource(mockedTypeormDataSource)

    // assert
    expect(sut.dataSources.length).toBe(1)
    expect(spySetDefaultDataSource).toHaveBeenCalledTimes(1)
  })

  test('Set default data source with invalid data source', () => {
    // arrange
    const sut: TransactionManager = Reflect.construct(TransactionManager, [])
    const spySetDefaultDataSource = jest.spyOn(sut, 'setDefaultDataSource')
    const mockedInvalidDataSource: any = createMock<any>()

    // act
    const action = (): void => sut
      .addDataSource(mockedTypeormDataSource)
      .setDefaultDataSource(mockedInvalidDataSource)

    // assert
    expect(() => action()).toThrow(
      new InvalidDataSourceError(
        '[TransactionManager][setDefaultDataSource] Invalid or non-existent DataSource'
      )
    )
    expect(spySetDefaultDataSource).toBeCalledTimes(1)
  })

  test('Get default data source', () => {
    // arrange
    const sut: TransactionManager = Reflect.construct(TransactionManager, [])
    sut
      .addDataSource(mockedTypeormDataSource)
      .setDefaultDataSource(mockedTypeormDataSource)

    // act
    const defaultDataSource: GenericDataSource = sut.defaultDataSource

    // assert
    expect(defaultDataSource).toBe(mockedTypeormDataSource)
  })

  test('Validate isTypeormDataSource polymorphism', () => {
    // arrange
    const sut: TransactionManager = Reflect.construct(TransactionManager, [])
    const mockedOptions: DataSourceOptions = createMock<DataSourceOptions>()
    const test: DataSource = new DataSource(mockedOptions)

    // act
    const isTypeormDataSource: boolean = sut.isTypeormDataSource(test)

    // assert
    expect(isTypeormDataSource).toBeTruthy()
  })

  test('Validate singleton', () => {
    // arrange
    const instanceOne: TransactionManager = TransactionManager.getInstance()
    const instanceTwo: TransactionManager = TransactionManager.getInstance()

    // act
    instanceOne
      .addDataSource(mockedTypeormDataSource)
      .setDefaultDataSource(mockedTypeormDataSource)

    // assert
    expect(instanceTwo.dataSources.length).toBe(1)
  })
})
