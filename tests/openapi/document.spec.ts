import { DefaultSwaggerDocument, IOpenapiVersions } from "../../src/commons"
import { Document } from "../../src/openapi"

describe('Document class tests', () => {
	test('It should retrieve the default Swagger Document', () => {
		// arrange
		const sut = new Document()
		const expectedResult = DefaultSwaggerDocument

		// act
		const result = sut.retrieveDocument()

		// assert
		expect(result).toEqual(expectedResult)
	})

	test('It should set openapi version', () => {
		const sut = new Document()
		const spy = jest.spyOn(sut, 'setOpenapi')
		const expectedOpenapiVersion = IOpenapiVersions["3.0.0"]
		const expectedResult = DefaultSwaggerDocument

		// act
		sut.setOpenapi(expectedOpenapiVersion)
		const result = sut.retrieveDocument()

		// assert
		expect(spy).toBeCalledTimes(1)
		expect(spy).toBeCalledWith(expectedOpenapiVersion)
		expect(result).toEqual(Object.assign(expectedResult, {
			openapi: expectedOpenapiVersion
		}))
	})

	test('It should set name', () => {
		const sut = new Document()
		const spy = jest.spyOn(sut, 'setName')
		const expectedName = 'test'
		const expectedResult = DefaultSwaggerDocument

		// act
		sut.setName(expectedName)
		const result = sut.retrieveDocument()

		// assert
		expect(spy).toBeCalledTimes(1)
		expect(spy).toBeCalledWith(expectedName)
		expect(result).toEqual(Object.assign(expectedResult, {
			info: {
				title: expectedName
			}
		}))
	})

	test('It should set version', () => {
		const sut = new Document()
		const spy = jest.spyOn(sut, 'setVersion')
		const expectedVersion = 'test'
		const expectedResult = DefaultSwaggerDocument

		// act
		sut.setVersion(expectedVersion)
		const result = sut.retrieveDocument()

		// assert
		expect(spy).toBeCalledTimes(1)
		expect(spy).toBeCalledWith(expectedVersion)
		expect(result).toEqual(Object.assign(expectedResult, {
			version: expectedVersion
		}))
	})
})