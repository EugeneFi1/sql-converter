import { Join } from "node-sql-parser";
import { AstJoinConfig, ColumnListItem } from "../models/ast.model";

export abstract class AstUtils {
  /**
   * return join statement
   * @param {AstJoinConfig} config
   * @returns {Join}
   */
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
        right: { type: "column_ref", table: right.table, column: right.column }
      }
    };
  }

  /**
   * pattern to generate AS select statement
   * @param {string} tableName
   * @param {string} fieldName
   * @returns {string} - AS statement
   */
  public static getAsConditionSelectStatement(
    tableName: string,
    fieldName: string
  ): string {
    return `${tableName}.${fieldName}`;
  }

  /**
   * from [{type}::{dbName}::{tableName}] to [tableName]
   * @param {string[]} tableList - table list specified by pattern {type}::{dbName}::{tableName}
   * @returns {string[]} - array of table names
   */
  public static getTableNameListFromAstTableList(
    tableList: string[]
  ): string[] {
    return tableList.reduce(
      (prevValue, currentValue) => [...prevValue, currentValue.split("::")[2]],
      []
    );
  }

  /**
   * @param {string[]} columnList - column list specified by pattern {type}::{tableName}::{columnName}
   * @param {string[]} tableList - table list specified by pattern {type}::{dbName}::{tableName}
   * @returns {ColumnListItem[]}
   */
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
            : undefined
        }
      ];
    }, []);
  }
}
