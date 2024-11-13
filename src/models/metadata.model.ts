export interface MetadataTable {
  id: number;
  name: string;
}

export enum MetadataFieldType {
  TEXT = "text",
  INTEGER = "integer",
  // relations type
  MANY_TO_MANY = "manyToMany",
  MANY_TO_ONE = "manyToOne",
  ONE_TO_MANY = "oneToMany",
}

export interface MetadataField {
  id: number;
  name: string;
  type: MetadataFieldType;
  tableMetadataId: number;
  relationFieldMetadataId?: number;
}

export interface MetadataStateConfig {
  tables: MetadataTable[];
  fields: MetadataField[];
}
