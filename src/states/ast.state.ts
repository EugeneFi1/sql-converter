import { BaseFrom, From, Parser, Select, TableExpr } from "node-sql-parser";
import { AstJoinConfig, AstStateConfig } from "../models/ast.model";
import { AstUtils } from "../utils/ast.utils";

/** class to handle Abstract Syntax Tree */
export class AstState {
  private parser = new Parser();
  private state: AstStateConfig;

  private get ast(): Select {
    return this.state?.ast;
  }

  /**
   * entry point: init ast from qyery
   * @param {string} query - sql string
   */
  public init(query: string): void {
    const tableColumnAst = this.parser.parse(query);
    const ast = tableColumnAst.ast;
    if (!Array.isArray(ast) && ast.type === "select") {
      const tableAsStatementMap = (ast.from as From[]).reduce(
        (prev, current: BaseFrom) => ({ ...prev, [current.table]: current.as }),
        {}
      );
      const tableList = AstUtils.getTableNameListFromAstTableList(
        tableColumnAst.tableList
      );
      this.state = {
        ast,
        tableList: tableList.map((val) => ({
          name: val,
          asStatement: tableAsStatementMap[val],
        })),
        columnList: AstUtils.getColumnListFromAstColumnList(
          tableColumnAst.columnList,
          tableList
        ),
      };
    } else {
      // throw error if not SELECT or multiple query
      throw new Error("Unsupported query");
    }
  }

  /**
   * @returns {string} - generated sql from AST
   */
  public generateSql(): string {
    return this.ast
      ? this.parser.sqlify(this.ast).replaceAll("`", '"')
      : undefined;
  }

  /**
   * @returns {AstStateConfig["columnList"]} - list of columns without their "FROM" tables
   */
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

  /**
   * add LEFT JOIN statement to AST
   * @param {AstJoinConfig} joinConfig
   */
  public addLeftJoin(joinConfig: AstJoinConfig): void {
    // get proper AST (for nested SELECT)
    const getAst = (ast: Select): Select => {
      const tableExpr = (ast.from as TableExpr[])
        .filter(({ expr }) => !!expr)
        .find((fromItem) => {
          const tableList = (fromItem.expr.ast.from as BaseFrom[]).map(
            ({ table }) => table
          );
          if (
            tableList.includes(joinConfig.right.table) ||
            tableList.includes(joinConfig.left.table)
          ) {
            return fromItem;
          }
        });
      return tableExpr ? getAst(tableExpr.expr.ast) : ast;
    };
    const astToUpdate = getAst(this.ast);
    (astToUpdate.from as From[]).push(
      AstUtils.getLeftJoinStatement(joinConfig)
    );
    this.updateAsStatementsBasedOnJoin(joinConfig, astToUpdate);
  }

  private updateAsStatementsBasedOnJoin(
    joinConfig: AstJoinConfig,
    ast: Select
  ): void {
    ast.columns.forEach((col) => {
      const { expr } = col;
      const firstFromTableName = ast.from[0].table;
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
