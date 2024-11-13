import { Join } from "node-sql-parser";
import { AstJoinCondition } from "../models/ast.model";

export abstract class AstUtils {
  public static getLeftJoinStatement(condition: AstJoinCondition): Join {
    const { left, right } = condition;
    return {
      db: null,
      table: condition.table,
      as: condition.as,
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
