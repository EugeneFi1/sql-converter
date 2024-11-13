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
    // init Abstract Syntax Tree
    this.initAST(query);
    // selected columns without their "FROM" tables
    const columnWitoutTables = this.astState.getColumnsWithoutTheirTables();
    // add JOIN statement logic if there are selected columns without their tables
    columnWitoutTables?.forEach((column) => {
      const fieldMetaData = this.metadataState.getFieldInfo(
        column.tableName,
        column.relationField
      );
      const relatedTableName = this.metadataState.getFieldTableMetadataName(
        fieldMetaData.relationFieldMetadataId
      );
      // left table name to JOIN
      let leftTableName = column.tableName;
      // add JOIN with many-to-many relations table
      if (fieldMetaData.type === MetadataFieldType.MANY_TO_MANY) {
        const manyToManyTableName =
          ConverterUtils.getManyToManyRelationsTableName(column);
        this.addLeftJoinForManyToManyRelations(
          manyToManyTableName,
          column.tableName
        );
        leftTableName = manyToManyTableName;
      }
      this.addLeftJoin(relatedTableName, leftTableName, column.relationField);
    });

    return this.getSqlFromAst();
  }

  // update AST with left join with many-to-many relations table
  private addLeftJoinForManyToManyRelations(
    tableName: string,
    columnTableName: string
  ): void {
    this.astState.addLeftJoin({
      table: tableName,
      left: {
        table: columnTableName,
        column: "id",
      },
      right: {
        table: tableName,
        column: ConverterUtils.getTablePersistedKeyName(columnTableName),
      },
    });
  }

  // update AST with left join
  private addLeftJoin(
    tableName: string,
    leftTableName: string,
    rightTableName: string
  ): void {
    this.astState.addLeftJoin({
      table: tableName,
      as: rightTableName,
      left: {
        table: leftTableName,
        column: ConverterUtils.getTablePersistedKeyName(rightTableName),
      },
      right: {
        table: rightTableName,
        column: "id",
      },
    });
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
