import { BaseFrom, From, Parser } from "node-sql-parser";
import { MetadataFieldType } from "./models/metadata.model";
import { AstState } from "./states/ast.state";
import { MetadataState } from "./states/metadata.state";
import { ConverterUtils } from "./utils/converter.utils";

export class Converter {
  private parser = new Parser();
  private astState = new AstState();

  constructor(private metadataState: MetadataState) {}

  public convert(query: string): string {
    this.initAST(query);

    const columnWitoutTables = this.astState.getColumnsWithoutTheirTables();

    // add JOIN statement logic if there are selected columns without their tables
    if (columnWitoutTables?.length) {
      columnWitoutTables.forEach((column) => {
        const fieldMetaData = this.metadataState.getFieldInfo(
          column.tableName,
          column.relationField
        );
        const relationTableName = this.metadataState.getRelationTableName(
          fieldMetaData.relationFieldMetadataId
        );
        let leftTableName = column.tableName;
        if (fieldMetaData.type === MetadataFieldType.MANY_TO_MANY) {
          // left Join
          const manyToManyTableName =
            ConverterUtils.getManyToManyTableName(column);
          // join with many-to-many relations table
          this.astState.addLeftJoin({
            table: manyToManyTableName,
            left: {
              table: column.tableName,
              column: "id",
            },
            right: {
              table: manyToManyTableName,
              column: ConverterUtils.getRelationFieldIdName(column.tableName),
            },
          });
          leftTableName = manyToManyTableName;
        }
        this.astState.addLeftJoin({
          table: relationTableName,
          as: column.relationField,
          left: {
            table: leftTableName,
            column: ConverterUtils.getRelationFieldIdName(column.relationField),
          },
          right: {
            table: column.relationField,
            column: "id",
          },
        });
      });
    }

    return this.getSqlFromAst();
  }

  private getSqlFromAst(): string {
    return this.astState.ast
      ? this.parser.sqlify(this.astState.ast).replaceAll("`", '"')
      : undefined;
  }

  private initAST(query: string): void {
    const tableColumnAst = this.parser.parse(query);
    const ast = tableColumnAst.ast;
    if (!Array.isArray(ast) && ast.type === "select") {
      const tableAsStatementMap = (ast.from as From[]).reduce(
        (prev, current: BaseFrom) => ({ ...prev, [current.table]: current.as }),
        {}
      );
      const tableList = ConverterUtils.getTableNameListFromAstTableList(
        tableColumnAst.tableList
      );
      this.astState.init({
        ast,
        tableList: tableList.map((val) => ({
          name: val,
          asStatement: tableAsStatementMap[val],
        })),
        columnList: ConverterUtils.getColumnListFromAstColumnList(
          tableColumnAst.columnList,
          tableList
        ),
      });
    } else {
      throw new Error("Unsupported query");
    }
  }
}
