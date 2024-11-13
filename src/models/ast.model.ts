import { Select } from "node-sql-parser";

export interface ColumnListItem {
  name: string;
  tableName: string;
  relationField?: string;
}

export interface TableListItem {
  name: string;
  asStatement?: string;
}

export interface AstStateConfig {
  ast: Select;
  tableList: TableListItem[];
  columnList: ColumnListItem[];
}

export interface ColumnTable {
  table: string;
  column: string;
}

export interface AstJoinConfig {
  table: string;
  as?: string;
  left: ColumnTable;
  right: ColumnTable;
}
