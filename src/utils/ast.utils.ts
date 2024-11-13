import { Join } from "node-sql-parser";
import { AstJoinConfig, ColumnListItem } from "../models/ast.model";

export abstract class AstUtils {
  public static getLeftJoinStatement(config: AstJoinConfig): Join {
    const { left, right } = config;
    return {
      db: null,
      table: config.table,
      as: config.as,
      join: "LEFT JOIN",
      on: {
        type: "binary_expr",
        operator: "=",
        left: { type: "column_ref", table: left.table, column: left.column },
        right: { type: "column_ref", table: right.table, column: right.column },
      },
    };
  }

  public static getAsConditionSelectStatement(
    tableName: string,
    fieldName: string
  ): string {
    return `${tableName}.${fieldName}`;
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
