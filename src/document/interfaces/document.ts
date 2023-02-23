import { IOpenapiVersions } from "../../commons"

export interface IDocument {
  retrieveDocument: () => any // TODO: Fix type
  setOpenapi: (version: IOpenapiVersions) => void
  setName: (name: string) => void
  setVersion: (version: string) => void
}
