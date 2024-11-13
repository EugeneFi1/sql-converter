import { From, Select } from "node-sql-parser";
import { AstJoinCondition, AstStateConfig } from "../models/ast.model";
import { AstUtils } from "../utils/ast.utils";

export class AstState {
  private state: AstStateConfig;

  public get ast(): Select {
    if (!this.state) {
      return;
    }
    return this.state.ast;
  }

  public init(config: AstStateConfig): void {
    this.state = config;
  }

  public getColumnsWithoutTheirTables(): AstStateConfig["columnList"] {
    const { columnList, tableList } = this.state;
    return columnList
      .filter(({ relationField }) => !!relationField)
      .filter(
        (column) =>
          !tableList.find(
            (table) =>
              table.name === column.relationField ||
              table.asStatement === column.relationField
          )
      );
  }

  public addLeftJoin(condition: AstJoinCondition): void {
    (this.ast.from as From[]).push(AstUtils.getLeftJoinStatement(condition));
    // update as statement
    this.ast.columns.forEach((col) => {
      const { expr } = col;
      const firstFromTableName = this.ast.from[0].table;
      if (expr.type === "column_ref") {
        if (expr.table === condition.table || expr.table === condition.as) {
          col.as = `${condition.as || condition.table}.${expr.column}`;
        } else if (!col.as && !expr.table) {
          expr.table = firstFromTableName;
        }
      } else if (expr.type === "aggr_func") {
        const argsExpr = col.expr.args.expr;
        let asCondition = condition.as || condition.table;
        if (!col.as && !argsExpr.table) {
          argsExpr.table = firstFromTableName;
          asCondition = firstFromTableName;
        }
        if (!col.as) {
          col.as = AstUtils.getAsConditionSelectStatement(
            asCondition,
            argsExpr.column
          );
        }
      }
    });
  }

  public addAsStatement(): void {}
}
