import { Knex } from 'knex'
import 'reflect-metadata'
import { createMock } from 'ts-auto-mock'
import { DataSource, DataSourceOptions } from 'typeorm'
import { GenericDataSource, ITransactionManager } from '../../src'
import { TransactionManagerException } from '../../src/errors'
import { MainTransactionManager } from '../../src/MainTransactionManager'
jest.mock('typeorm', () => {
  const mockClass: jest.MockedClass<any> = jest.fn((...args: any) => {
    const instance = Object.create(DataSource.prototype)

    return Object.assign(instance, { args })
  })

  return {
    DataSource: mockClass
  }
})

describe('MainTransactionManager', () => {
  const mockedTypeormDataSource: DataSource = createMock<DataSource>()

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Add unique data sources', () => {
    // arrange
    const sut: MainTransactionManager = Reflect.construct(MainTransactionManager, [])
    const spyAddDataSource: jest.SpyInstance<
    Pick<ITransactionManager, 'addDataSource' | 'setDefaultDataSource'>,
    [dataSource: DataSource | Knex],
    any
    > = jest.spyOn(sut, 'addDataSource')

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
    const sut: MainTransactionManager = Reflect.construct(MainTransactionManager, [])
    const spySetDefaultDataSource = jest.spyOn(sut, 'setDefaultDataSource')

    // act
    sut.addDataSource(mockedTypeormDataSource).setDefaultDataSource(mockedTypeormDataSource)

    // assert
    expect(sut.dataSources.length).toBe(1)
    expect(spySetDefaultDataSource).toHaveBeenCalledTimes(1)
  })

  test('Set default data source with invalid data source', () => {
    // arrange
    const sut: MainTransactionManager = Reflect.construct(MainTransactionManager, [])
    const spySetDefaultDataSource = jest.spyOn(sut, 'setDefaultDataSource')
    const mockedInvalidDataSource: any = createMock<any>()

    // act
    const action = (): void =>
      sut.addDataSource(mockedTypeormDataSource).setDefaultDataSource(mockedInvalidDataSource)

    // assert
    expect(() => action()).toThrow(
      new TransactionManagerException(
        '[TransactionManager][setDefaultDataSource] Invalid or non-existent DataSource'
      )
    )
    expect(spySetDefaultDataSource).toBeCalledTimes(1)
  })

  test('Get default data source', () => {
    // arrange
    const sut: MainTransactionManager = Reflect.construct(MainTransactionManager, [])
    sut.addDataSource(mockedTypeormDataSource).setDefaultDataSource(mockedTypeormDataSource)

    // act
    const defaultDataSource: GenericDataSource = sut.getDefaultDataSource()

    // assert
    expect(defaultDataSource).toBe(mockedTypeormDataSource)
  })

  test('Validate isTypeormDataSource polymorphism', () => {
    // arrange
    const sut: MainTransactionManager = Reflect.construct(MainTransactionManager, [])
    const mockedOptions: DataSourceOptions = createMock<DataSourceOptions>()
    const mockedDataSource: DataSource = new DataSource(mockedOptions)

    // act
    const isCorrectDataSourceSource: boolean = sut.isTypeormDataSource(mockedDataSource)

    // assert
    expect(isCorrectDataSourceSource).toBeTruthy()
  })

  test('Validate isKnexDataSource polymorphism', () => {
    // arrange
    const sut: MainTransactionManager = Reflect.construct(MainTransactionManager, [])
    const mockedDataSource = Object.create({ name: 'knex', ...createMock<Knex>() })

    // act
    const isCorrectDataSourceSource: boolean = sut.isKnexDataSource(mockedDataSource)

    // assert
    expect(isCorrectDataSourceSource).toBeTruthy()
  })

  test('Validate getKnexTransaction', async () => {
    // arrange
    const mockedDataSource: Knex = Object.create({ name: 'knex', ...createMock<Knex>() })
    const sut: MainTransactionManager = Reflect.construct(MainTransactionManager, [])
    sut.addDataSource(mockedDataSource).setDefaultDataSource(mockedDataSource)
    sut.isKnexDataSource(mockedDataSource)

    // act
    const knexTransaction: Knex.Transaction | undefined = await sut.getKnexTransaction()

    // assert
    expect(knexTransaction).not.toBeUndefined()
  })

  test('Validate getKnexTransaction for invalid transaction provider', async () => {
    // arrange
    const sut: MainTransactionManager = Reflect.construct(MainTransactionManager, [])
    jest.spyOn(sut, 'getKnexTransactionProvider').mockReturnValue(undefined)

    // act
    const knexTransaction = async (): Promise<Knex.Transaction | undefined> => await sut.getKnexTransaction()

    // assert
    await expect(async () => await knexTransaction()).rejects.toThrow(
      new TransactionManagerException('[TransactionManager][getKnexTransaction] Invalid knexTransactionProvider')
    )
  })

  test('Validate singleton', () => {
    // arrange
    const instanceOne: MainTransactionManager = MainTransactionManager.getInstance()
    const instanceTwo: MainTransactionManager = MainTransactionManager.getInstance()

    // act
    instanceOne.addDataSource(mockedTypeormDataSource).setDefaultDataSource(mockedTypeormDataSource)

    // assert
    expect(instanceTwo.dataSources.length).toBe(1)
  })
})
