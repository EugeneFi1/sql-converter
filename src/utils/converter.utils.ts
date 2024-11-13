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

  // the format of tableList item is {type}::{dbName}::{tableName}
  public static getTableNameListFromAstTableList(
    tableList: string[]
  ): string[] {
    return tableList.reduce(
      (prevValue, currentValue) => [...prevValue, currentValue.split("::")[2]],
      []
    );
  }

  // the format of columnList item is {type}::{tableName}::{columnName}
  public static getColumnListFromAstColumnList(
    columnList: string[],
    tableList: string[]
  ): ColumnListItem[] {
    return columnList.reduce((prevValue, currentValue) => {
      const [type, tableName, fieldName] = currentValue.split("::");
      const isTableNameNotIncludedInTablesList = !tableList.includes(tableName);
      const isTableNameNull = tableName === "null";
      const relationField = isTableNameNull ? undefined : tableName;
      return [
        ...prevValue,
        {
          name: fieldName,
          tableName:
            isTableNameNotIncludedInTablesList || isTableNameNull
              ? tableList[0]
              : tableName,
          relationField: isTableNameNotIncludedInTablesList
            ? relationField
            : undefined,
        },
      ];
    }, []);
  }
}
