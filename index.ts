import { Converter } from "./src/converter";
import { MetadataStateConfig } from "./src/models/metadata.model";
import { MetadataState } from "./src/states/metadata.state";

export class SqlConverter {
  private converter: Converter;
  private metaDataState: MetadataState;

  /**
   * @param {MetadataStateConfig} config - config to init metadata
   */
  constructor(config: MetadataStateConfig) {
    this.metaDataState = new MetadataState(config);
    this.converter = new Converter(this.metaDataState);
  }

  /**
   * @param {string} query - intermediate transaction language string
   * @returns {string} formatted SQL-query
   */
  public convert(query: string): string {
    return this.converter.convert(query);
  }
}
