import { MetadataFieldType } from "./models/metadata.model";
import { AstState } from "./states/ast.state";
import { MetadataState } from "./states/metadata.state";
import { ConverterUtils } from "./utils/converter.utils";

export class Converter {
  private astState = new AstState();

  constructor(private metadataState: MetadataState) {}

  /**
   * @param {string} query - intermediate transaction language string
   * @returns {string} formatted SQL-query
   */
  public convert(query: string): string {
    // init Abstract Syntax Tree
    this.astState.init(query);
    // selected columns without their "FROM" tables
    const columnWitoutTables = this.astState.getColumnsWithoutTheirTables();
    // automatically add the JOIN according to the metadata
    // (add JOIN statement logic if there are selected columns without their tables)
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
        leftTableName = manyToManyTableName;
        this.addLeftJoinForManyToManyRelations(
          manyToManyTableName,
          column.tableName
        );
      }
      this.addLeftJoin(relatedTableName, leftTableName, column.relationField);
    });

    return this.astState.generateSql();
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
}
