import { Join } from "node-sql-parser";
import { AstJoinConfig } from "../models/ast.model";

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
}
