import {
  MetadataField,
  MetadataStateConfig,
  MetadataTable,
} from "../models/metadata.model";

/** class to handle tables metadata */
export class MetadataState {
  // MetadataTable: MetadataField
  private tableFiledsMap: Record<
    MetadataTable["name"],
    Record<MetadataField["name"], MetadataField>
  > = {};
  // map between table id and name - MetadataTable.id: MetadataTable.name
  private tableIdToNameMap: Record<MetadataTable["id"], MetadataTable["name"]> =
    {};
  // map between field id and fieldMetadata - MetadataField.id: MetadataField
  private filedIdToFieldMap: Record<MetadataField["id"], MetadataField> = {};

  /**
   * @param {MetadataStateConfig} config - metadata config
   */
  constructor(config: MetadataStateConfig) {
    this.initMaps(config);
  }

  /**
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

  /**
   * @param {MetadataField["id"]} fieldId - field id
   * @returns {MetadataTable["name"]} -
   */
  public getFieldTableMetadataName(fieldId: MetadataField["id"]): string {
    const field = this.filedIdToFieldMap[fieldId];
    return this.tableIdToNameMap[field.tableMetadataId];
  }

  private initMaps(config: MetadataStateConfig): void {
    this.filedIdToFieldMap = config.fields.reduce(
      (prevValue, currentValue) => ({
        ...prevValue,
        [currentValue.id]: currentValue,
      }),
      {}
    );

    config.tables.forEach((table) => {
      this.tableIdToNameMap[table.id] = table.name;
      this.tableFiledsMap[table.name] = config.fields
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
}
