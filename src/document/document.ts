import {
  DefaultSwaggerDocument,
  IOpenapiVersions,
  ISwaggerDocument
} from '../commons'
import { IDocument } from './interfaces'

export class Document implements IDocument {
  private readonly document: ISwaggerDocument = DefaultSwaggerDocument

  retrieveDocument(): any {
    // TODO: Fix type
    return this.document
  }

  /**
   *
   * @param version
   */
  setOpenapi(version: IOpenapiVersions): void {
    this.document.openapi = version
  }

  /**
   *
   * @param name
   */
  setName(name: string): void {
    this.document.info.title = name
  }

  /**
   *
   * @param version
   */
  setVersion(version: string): void {
    this.document.version = version
  }
}
