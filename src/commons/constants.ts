import { name, version } from '../../package.json'
export interface ISwaggerDocument {
  [key: string]: any // TODO: Fix type
}
export enum IOpenapiVersions {
	'3.0.0',
}
const OpenapiVersion = '3.0.0'
export const DefaultSwaggerDocument = {
	openapi: OpenapiVersion,
	explorer: true,
	info: {
		title: name
	},
	version,
	servers: [],
	tags: [],
	paths: {},
	components: { schemas: {} }
}