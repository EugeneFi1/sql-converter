import { ColumnListItem } from "../models/ast.model";

export abstract class ConverterUtils {
  /**
   * name pattern for many-to-many relations table
   * @param {ColumnListItem} column
   * @returns {string} - many-to-many relations table name
   */
  public static getManyToManyRelationsTableName(
    column: ColumnListItem
  ): string {
    return `${column.tableName}_${column.relationField}`;
  }

  /**
   * name pattern for table persisted key name
   * @param {string} relatedTableName - related table name
   * @returns {string} - table persisted key name
   */
  public static getTablePersistedKeyName(relatedTableName: string): string {
    return `${relatedTableName}_id`;
  }
}
