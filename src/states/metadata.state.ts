import {
  MetadataField,
  MetadataStateConfig,
  MetadataTable,
} from "../models/metadata.model";

/** class to handle tables metadata */
export class MetadataState {
  private config: MetadataStateConfig;
  private tableFiledsMap: Record<
    MetadataTable["name"],
    Record<MetadataField["name"], MetadataField>
  > = {};
  private tableIdToNameMap: Record<MetadataTable["id"], MetadataTable["name"]> =
    {};
  private filedIdToFieldMap: Record<MetadataField["id"], MetadataField> = {};

  /**
   * @param {MetadataStateConfig} config - metadata config
   */
  constructor(config: MetadataStateConfig) {
    this.config = config;
    this.filedIdToFieldMap = this.config.fields.reduce(
      (prevValue, currentValue) => ({
        ...prevValue,
        [currentValue.id]: currentValue,
      }),
      {}
    );
    this.config.tables.forEach((table) => {
      this.tableIdToNameMap[table.id] = table.name;
      this.tableFiledsMap[table.name] = this.config.fields
        .filter(({ tableMetadataId }) => tableMetadataId === table.id)
        .reduce(
          (prevValue, currentValue) => ({
            ...prevValue,
            [currentValue.name]: currentValue,
          }),
          {}
        );
    });
  }

  /**
   *
   * @param {MetadataTable["name"]} tableName
   * @param {MetadataField["name"]} fieldName
   * @returns {MetadataField | undefined} field metadata, undefined if empty result
   */
  public getFieldInfo(
    tableName: MetadataTable["name"],
    fieldName: MetadataField["name"]
  ): MetadataField | undefined {
    return this.tableFiledsMap[tableName][fieldName];
  }

  public getRelationTableName(fieldId: number): string {
    const field = this.filedIdToFieldMap[fieldId];
    return this.tableIdToNameMap[field.tableMetadataId];
  }
}
