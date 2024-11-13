import { From, Select } from "node-sql-parser";
import { AstJoinConfig, AstStateConfig } from "../models/ast.model";
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

  public addLeftJoin(joinConfig: AstJoinConfig): void {
    (this.ast.from as From[]).push(AstUtils.getLeftJoinStatement(joinConfig));
    // update AS statements for SELECT columns
    this.updateAsStatementsBasedOnJoin(joinConfig);
  }

  private updateAsStatementsBasedOnJoin(joinConfig: AstJoinConfig): void {
    this.ast.columns.forEach((col) => {
      const { expr } = col;
      const firstFromTableName = this.ast.from[0].table;
      const { table, as } = joinConfig;
      let tableName = as || table;
      switch (expr.type) {
        case "column_ref":
          if (expr.table === table || expr.table === as) {
            col.as = `${tableName}.${expr.column}`;
          } else if (!col.as && !expr.table) {
            expr.table = firstFromTableName;
          }
          break;
        case "aggr_func":
          const argsExpr = col.expr.args.expr;
          if (!col.as) {
            if (!argsExpr.table) {
              tableName = argsExpr.table = firstFromTableName;
            }
            col.as = AstUtils.getAsConditionSelectStatement(
              tableName,
              argsExpr.column
            );
          }
      }
    });
  }
}
