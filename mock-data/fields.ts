import { MetadataFieldType } from "../src/models/metadata.model";

export const FIELD_METADATA = [
  // "users" table fields
  {
    id: 11,
    name: "id",
    type: MetadataFieldType.INTEGER,
    tableMetadataId: 1,
    relationFieldMetadataId: undefined,
  },
  {
    id: 12,
    name: "first_name",
    type: MetadataFieldType.TEXT,
    tableMetadataId: 1,
    relationFieldMetadataId: undefined,
  },
  {
    id: 13,
    name: "last_name",
    type: MetadataFieldType.TEXT,
    tableMetadataId: 1,
    relationFieldMetadataId: undefined,
  },
  {
    id: 14,
    name: "departments",
    type: MetadataFieldType.MANY_TO_MANY,
    tableMetadataId: 1,
    relationFieldMetadataId: 21,
  },
  // "users_departments" table fields
  {
    id: 31,
    name: "id",
    type: MetadataFieldType.INTEGER,
    tableMetadataId: 3,
    relationFieldMetadataId: undefined,
  },
  {
    id: 32,
    name: "users_id",
    type: MetadataFieldType.INTEGER,
    tableMetadataId: 3,
    relationFieldMetadataId: undefined,
  },
  {
    id: 33,
    name: "departments_id",
    type: MetadataFieldType.INTEGER,
    tableMetadataId: 3,
    relationFieldMetadataId: undefined,
  },
  // "departments" table fields
  {
    id: 21,
    name: "id",
    type: MetadataFieldType.INTEGER,
    tableMetadataId: 2,
    relationFieldMetadataId: undefined,
  },
  {
    id: 22,
    name: "name",
    type: MetadataFieldType.TEXT,
    tableMetadataId: 2,
    relationFieldMetadataId: undefined,
  },
  // "tasks" table fields
  {
    id: 41,
    name: "id",
    type: MetadataFieldType.INTEGER,
    tableMetadataId: 4,
    relationFieldMetadataId: undefined,
  },
  {
    id: 42,
    name: "title",
    type: MetadataFieldType.TEXT,
    tableMetadataId: 4,
    relationFieldMetadataId: undefined,
  },
  {
    id: 43,
    name: "owner",
    type: MetadataFieldType.MANY_TO_ONE,
    tableMetadataId: 4,
    relationFieldMetadataId: 11,
  },
  {
    id: 44,
    name: "watchers",
    type: MetadataFieldType.MANY_TO_MANY,
    tableMetadataId: 4,
    relationFieldMetadataId: 11,
  },
];
