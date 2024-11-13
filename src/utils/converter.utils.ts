import { ColumnListItem } from "../models/ast.model";

export abstract class ConverterUtils {
  public static getManyToManyTableName(column: ColumnListItem): string {
    return `${column.tableName}_${column.relationField}`;
  }

  public static getRelationFieldIdName(table: string): string {
    return `${table}_id`;
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
