import { isString } from '@gradii/check-type';
import { AssignmentSetClause } from '../../query/ast/assignment-set-clause';
import { BinaryUnionQueryExpression } from '../../query/ast/binary-union-query-expression';
import { BindingVariable } from '../../query/ast/binding-variable';
import { ColumnReferenceExpression } from '../../query/ast/column-reference-expression';
import { DeleteSpecification } from '../../query/ast/delete-specification';
import { AsExpression } from '../../query/ast/expression/as-expression';
import { BetweenPredicateExpression } from '../../query/ast/expression/between-predicate-expression';
import { BinaryExpression } from '../../query/ast/expression/binary-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { ConditionExpression } from '../../query/ast/expression/condition-expression';
import { ExistsPredicateExpression } from '../../query/ast/expression/exists-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression';
import { NullPredicateExpression } from '../../query/ast/expression/null-predicate-expression';
import { NumberLiteralExpression } from '../../query/ast/expression/number-literal-expression';
import { ParenthesizedExpression } from '../../query/ast/expression/parenthesized-expression';
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { StringLiteralExpression } from '../../query/ast/expression/string-literal-expression';
import { AggregateFragment } from '../../query/ast/fragment/aggregate-fragment';
import { NestedPredicateExpression } from '../../query/ast/fragment/expression/nested-predicate-expression';
import { JoinFragment } from '../../query/ast/fragment/join-fragment';
import { JsonPathColumn } from '../../query/ast/fragment/json-path-column';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';
import { UnionFragment } from '../../query/ast/fragment/union-fragment';
import { FromClause } from '../../query/ast/from-clause';
import { FromTable } from '../../query/ast/from-table';
import { GroupByClause } from '../../query/ast/group-by-clause';
import { HavingClause } from '../../query/ast/having-clause';
import { Identifier } from '../../query/ast/identifier';
import { IdentifyVariableDeclaration } from '../../query/ast/identify-variable-declaration';
import { InsertSpecification } from '../../query/ast/insert-specification';
import { JoinClause } from '../../query/ast/join-clause';
import { JoinExpression } from '../../query/ast/join-expression';
import { JoinOnExpression } from '../../query/ast/join-on-expression';
import { JoinedTable } from '../../query/ast/joined-table';
import { JsonPathExpression } from '../../query/ast/json-path-expression';
import { LimitClause } from '../../query/ast/limit-clause';
import { LockClause } from '../../query/ast/lock-clause';
import { OffsetClause } from '../../query/ast/offset-clause';
import { OrderByClause } from '../../query/ast/order-by-clause';
import { OrderByElement } from '../../query/ast/order-by-element';
import { PathExpression } from '../../query/ast/path-expression';
import { QueryExpression } from '../../query/ast/query-expression';
import { QuerySpecification } from '../../query/ast/query-specification';
import { RangeVariableDeclaration } from '../../query/ast/range-variable-declaration';
import { SelectClause } from '../../query/ast/select-clause';
import { SelectInsertSource } from '../../query/ast/select-insert-source';
import { SelectScalarExpression } from '../../query/ast/select-scalar-expression';
import { TableName } from '../../query/ast/table-name';
import { TableReferenceExpression } from '../../query/ast/table-reference-expression';
import { UpdateSpecification } from '../../query/ast/update-specification';
import { ValuesInsertSource } from '../../query/ast/values-insert-source';
import { WhereClause } from '../../query/ast/where-clause';
import { SqlNode } from '../../query/sql-node';
import { SqlVisitor } from '../../query/sql-visitor';
import { resolveIdentifier } from '../ast-helper';
import { resolveForwardRef } from '../forward-ref';
import { GrammarInterface } from '../grammar.interface';
import { QueryBuilder } from '../query-builder';

export class QueryBuilderVisitor implements SqlVisitor {
  protected inJoinExpression: boolean = false;
  protected explicitBindingType: string;

  public updateTarget;

  constructor(
    protected _grammar: GrammarInterface,
    /**
     * @deprecated
     * todo remove queryBuilder. should use binding only
     */
    protected _queryBuilder: QueryBuilder
  ) {
  }

  visit() {
    return 'hello';
  }

  visitAggregateFragment(node: AggregateFragment) {
    throw new Error('not implement yet');
    //todo
    // return this._grammar.compileAggregateFragment(
    //   node.aggregateFunctionName,
    //   node.aggregateColumns
    // );
  }

  visitAsExpression(node: AsExpression) {
    return `${node.name.accept(this)} AS ${node.as.accept(this)}`;
  }

  visitDeleteSpecification(node: DeleteSpecification) {
    let sql = `DELETE FROM ${node.target.accept(this)}`;

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`;
    }
    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }
    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`;
    }
    return sql;
  }

  visitAssignmentSetClause(node: AssignmentSetClause) {
    return `${node.column.accept(this)} = ${node.value.accept(this)}`;
  }

  visitBetweenPredicateExpression(node: BetweenPredicateExpression) {
    return `${
      node.expression.accept(this)}${node.not ? ' NOT' : ''
    } BETWEEN ${node.leftBetween.accept(this)} AND ${node.rightBetween.accept(this)}`;
  }

  visitBinaryExpression(node: BinaryExpression) {
    // 'and' | 'or'
    return `${node.left.accept(this)} ${node.operator.toUpperCase()} ${node.right.accept(this)}`;
  }

  visitBinaryUnionQueryExpression(node: BinaryUnionQueryExpression) {
    let sql;
    if (node.left instanceof BinaryUnionQueryExpression) { //todo check
      sql = `${node.left.accept(this)} UNION${node.all ? ' ALL' : ''} (${node.right.accept(this)})`;
    } else {
      sql = `(${node.left.accept(this)}) UNION${node.all ? ' ALL' : ''} (${node.right.accept(this)})`;
    }

    sql += this.visitQueryExpression(node);

    return sql;
  }

  /**
   * todo fixme binding variable
   * generate a placeholder for sql
   * @param node
   */
  visitBindingVariable(node: BindingVariable) {
    this._queryBuilder.addBinding(
      node.bindingExpression.accept(this),
      this.explicitBindingType ??
      (node.type === 'where' && this.inJoinExpression ? 'join' : node.type)
    );
    // this._queryBuilder.addBinding(node.bindingExpression.dispatch(this), 'where')
    return `?`;
  }

  visitColumnReferenceExpression(node: ColumnReferenceExpression) {
    const columnName = resolveIdentifier(node.fieldAliasIdentificationVariable);
    if (columnName) {
      return `${node.expression.accept(this)} AS ${this._grammar.quoteColumnName(
        columnName
      )}`;
    } else {
      return `${node.expression.accept(this)}`;
    }
  }

  visitCommonValueExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitComparisonExpression(node: ComparisonPredicateExpression) {
    return `${node.left.accept(this)} ${node.operator} ${node.right.accept(this)}`;
  }

  /**
   * todo `AND` is not right here.
   * @param node
   */
  visitConditionExpression(node: ConditionExpression) {
    return node.conditionTerms.map(it => it.accept(this)).join(' AND ');
  }

  visitConditionTermExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitExistsPredicateExpression(node: ExistsPredicateExpression) {
    return `${node.not ? 'NOT EXISTS' : 'EXISTS'} ${node.expression.accept(this)}`;
  }

  visitFieldAsExpression(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitFromClause(node: FromClause) {
    if (node.joins.length > 0) {
      const joins = node.joins.map(it => it.accept(this));
      return `FROM ${node.from.accept(this)} ${joins.join(' ')}`;
    } else {
      return `FROM ${node.from.accept(this)}`;
    }

  }

  visitFromTable(node: FromTable) {
    let rst;
    // if (node.table instanceof Identifier) {
    //   const tableName = node.table.accept(this);
    //   rst             = this._grammar.quoteTableName(tableName);
    // } else {
    rst = node.table.accept(this);
    // }
    if (node.indexBy) {
      // const indexBy = this._grammar.indexby(node.indexBy.dispatch(this));
      // result += indexBy;
    }
    return rst;
  }

  visitFunctionCallExpression(node: FunctionCallExpression) {
    return `${node.name.accept(this)}(${
      node.parameters.map(it => it.accept(this)).join(', ')
    })`;
  }

  visitGroupByClause(node: GroupByClause) {
    return `GROUP BY ${node.groups.map(it => it.accept(this)).join(', ')}`;
  }

  visitHavingClause(node: HavingClause) {
    return `HAVING ${node.expressions.map(it => it.accept(this)).join(',')}`;
  }

  visitIdentifier(node: Identifier) {
    if (isString(node.name)) {
      return node.name;
    }
    return resolveForwardRef(node.name);
  }

  /**
   * @deprecated
   * @param node
   */
  visitIdentifyVariableDeclaration(node: IdentifyVariableDeclaration): string {
    let rst                               = '';
    const visitedRangeVariableDeclaration = node.rangeVariableDeclaration.accept(this);
    rst += visitedRangeVariableDeclaration;
    if (node.indexBy) {
      // const indexBy = this._grammar.indexby(node.indexBy.dispatch(this));
      // result += indexBy;
    }
    return rst;
  }

  visitInPredicateExpression(node: InPredicateExpression) {
    if (node.subQuery) {
      return `${node.expression.accept(this)}${node.not ? ' NOT' : ''
      } IN ${node.subQuery.accept(this)}`;
    }

    if (node.values.length === 0) {
      if (node.not) {
        return `1 = 1`;
      } else {
        return `0 = 1`;
      }
    }
    return `${node.expression.accept(this)}${node.not ? ' NOT' : ''
    } IN (${node.values.map(it => it.accept(this)).join(', ')})`;
  }

  visitInsertSpecification(node: InsertSpecification) {
    let sql = `INSERT ${node.insertOption.toUpperCase()} ${node.target.accept(this)}`;
    sql += ` (${node.columns.map(it => it.accept(this)).join(', ')})`;
    sql += `${node.insertSource.accept(this)}`;
    return sql;
  }

  visitJoinClause(node: JoinClause) {
    throw new Error('not implement');
  }

  visitJoinExpression(node: JoinExpression) {
    this.inJoinExpression = true;
    //todo remove identifier check
    let tableName;
    if (node.name instanceof Identifier) {
      tableName = this._grammar.quoteTableName(node.name.accept(this));
    } else if (node.name instanceof JoinedTable) {
      tableName = `(${node.name.accept(this)})`;
    } else {
      tableName = `${node.name.accept(this)}`;
    }
    const sql             = `${node.type.toUpperCase()} JOIN ${tableName}${node.on ? ` ON ${node.on.accept(
      this)}` : ''}`;
    this.inJoinExpression = false;
    return sql;
  }

  visitJoinFragment(node: JoinFragment) {
    return this._grammar.compileJoinFragment(node.joinQueryBuilder, this);
  }

  visitJoinOnExpression(node: JoinOnExpression) {
    return `${node.columnExpression.accept(this)} ${node.operator} ${node.rightExpression.accept(this)}`;
  }

  visitJoinedTable(node: JoinedTable) {
    return `${node.from.accept(this)} ${node.joinExpressions.map(it => it.accept(this)).join(' ')}`;
  }

  visitJsonPathColumn(node: JsonPathColumn) {
    return `json_extract(${node.columns.accept(this)}, ${node.jsonPaths.accept(this)})`;
  }

  visitJsonPathExpression(node: JsonPathExpression) {
    return `'$.${node.paths.map(it => `"${it.accept(this)}"`).join('.')}'`;
  }

  visitLimitClause(node: LimitClause) {
    return `LIMIT ${node.value}`;
  }

  visitNestedExpression(node: NestedExpression) {

    let sql;
    if (node.expression instanceof QueryBuilder) {
      sql = `(${this._grammar.compileSelect(node.expression)})`;

      this._queryBuilder.addBinding(node.expression.getBindings(), node.type);
    } else if (node.expression instanceof RawExpression) {
      //todo check raw binding. should put it in node type
      sql = `(${node.expression.accept(this)})`;
      // node.bindings.forEach(it => {
      //   it.accept(this);
      // });
      this._queryBuilder.addBinding(node.bindings, node.type);
    } else {
      sql = `(${node.expression})`;

      // node.bindings.forEach(it => {
      //   it.accept(this);
      // });
      this._queryBuilder.addBinding(node.bindings, node.type);
    }


    return sql;
  }

  visitNestedPredicateExpression(node: NestedPredicateExpression) {
    if (node.query instanceof QueryBuilder) {
      return this._grammar.compileNestedPredicate(node.query, this);
    } else {
      return `(${node.query})`;
    }
  }

  visitNodePart(node: SqlNode) {
    return 'node part';
  }

  visitNullPredicateExpression(node: NullPredicateExpression) {
    if (node.expression.expression instanceof JsonPathColumn) {
      const sql = node.expression.accept(this);
      if (node.not) {
        return `(${sql} IS NOT NULL AND json_type(${sql}) != 'NULL')`;
      } else {
        return `(${sql} IS NULL OR json_type(${sql}) = 'NULL')`;
      }
    }
    return `${node.expression.accept(this)}${node.not ? ' IS NOT NULL' : ' IS NULL'}`;
  }

  visitNumberLiteralExpression(node: NumberLiteralExpression) {
    return `${node.value}`;
  }

  visitOffsetClause(node: OffsetClause) {
    return `OFFSET ${node.offset}`;
  }

  visitOrderByClause(node: OrderByClause) {
    return `ORDER BY ${node.elements.map(it => it.accept(this)).join(', ')}`;
  }

  visitOrderByElement(node: OrderByElement) {
    return `${node.column.accept(this)} ${node.direction.toUpperCase()}`;
  }

  visitParenthesizedExpression(node: ParenthesizedExpression) {
    return `(${node.expression.accept(this)})`;
  }

  visitPathExpression(node: PathExpression) {
    const columns = [];
    for (let i = 0; i < node.paths.length; i++) {
      const identifier = node.paths[i];
      const columnName = identifier.accept(this);
      if (columnName === '*') {
        columns.push(columnName);
      } else {
        if (i === node.paths.length - 2) {
          if (identifier instanceof Identifier) {
            columns.push(this._grammar.quoteTableName(columnName));
          } else if (identifier instanceof FromTable) {
            if (columnName)
              columns.push(columnName.split(/\s+as\s+/i).pop());
          } else {
            //todo
            columns.push(columnName);
          }

        } else {
          columns.push(this._grammar.quoteColumnName(columnName));
        }
      }
    }

    return columns.join('.');
  }

  visitQueryExpression(node: QueryExpression) {
    let sql = '';
    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`;
    }

    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`;
    }

    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }

    return sql;
  }

  visitQuerySpecification(node: QuerySpecification) {
    let sql = `${node.selectClause.accept(this)}`;

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if (node.groupByClause) {
      sql += ` ${node.groupByClause.accept(this)}`;
    }

    if (node.havingClause) {
      sql += ` ${node.havingClause.accept(this)}`;
    }

    if (node.lockClause) {
      sql += ` ${node.lockClause.accept(this)}`;
    }

    sql += this.visitQueryExpression(node);

    return sql;
  }

  visitRangeVariableDeclaration(node: RangeVariableDeclaration) {
    const quoteTableName = this._grammar.quoteTableName(node.abstractSchemaName);
    if (node.aliasIdentificationVariable) {
      return `${quoteTableName} AS ${this._grammar.quoteTableName(node.aliasIdentificationVariable)}`;
    } else {
      return `${quoteTableName}`;
    }
  }

  visitRawBindingExpression(node: RawBindingExpression) {
    node.bindings.forEach(it => {
      it.accept(this);
    });
    return `${node.raw.accept(this)}`;
  }

  visitRawExpression(node: RawExpression) {
    return node.value;
  }

  visitSelectClause(node: SelectClause) {
    if (node.selectExpressions.length > 0) {
      const selectExpressions = node.selectExpressions.map(expression => {
        return expression.accept(this);
      });
      return `SELECT${node.distinct ? ` ${this._grammar.distinct(node.distinct)} ` : ' '}${selectExpressions.join(
        ', ')}`;
    } else {
      return `SELECT${node.distinct ? ` ${this._grammar.distinct(node.distinct)} ` : ' '}*`;
    }
  }

  visitSelectInsertSource(node: SelectInsertSource) {
  }

  visitSelectScalarExpression(node: SelectScalarExpression) {
    return `${node.expression.accept(this)} AS ${node.columnName.accept(this)}`;
  }

  visitSetClause(node: SqlNode) {
    throw new Error('Method not implemented.');
  }

  visitStringLiteralExpression(node: StringLiteralExpression) {
    return `"${node.value}"`;
  }

  visitTableName(node: TableName) {
    const tableName = [];
    if (node.serverIdentifier) {
      tableName.push(node.serverIdentifier.accept(this));
    }
    if (node.databaseIdentifier) {
      tableName.push(node.databaseIdentifier.accept(this));
    }
    if (node.schemaIdentifier) {
      tableName.push(this._grammar.quoteSchemaName(node.schemaIdentifier.accept(this)));
    }

    if (node.baseIdentifier) {
      tableName.push(this._grammar.quoteTableName(node.baseIdentifier.accept(this)));
    } else {
      throw new Error('invalid table name');
    }

    return tableName.join('.');
  }

  visitTableReferenceExpression(node: TableReferenceExpression) {
    let name;
    if (node.expression instanceof Identifier) {
      name = this._grammar.quoteTableName(node.expression.accept(this));
    } else if (node.expression instanceof PathExpression) {
      name = node.expression.accept(this);
    } else if (node.expression instanceof TableName) {
      name = node.expression.accept(this);
    } else {
      //todo improve me
      name = node.expression.accept(this);
    }
    if (node.alias) {
      const as = this._grammar.quoteTableName(node.alias.accept(this));
      return `${name} AS ${as}`;
    } else {
      return name;
    }
  }

  visitUnionFragment(node: UnionFragment) {
    // return ` UNION${node.all ? ' ALL' : ''}`;
    throw new Error('should not run');
  }

  visitUpdateSpecification(node: UpdateSpecification) {
    let sql = `UPDATE ${node.target.accept(this)}`;

    sql += ` SET ${node.setClauses.map(
      it => it.accept(this)).join(', ')
    }`;

    if (node.fromClause) {
      sql += ` ${node.fromClause.accept(this)}`;
    }

    if (node.whereClause) {
      sql += ` ${node.whereClause.accept(this)}`;
    }

    if (node.orderByClause) {
      sql += ` ${node.orderByClause.accept(this)}`;
    }
    if (node.offsetClause) {
      sql += ` ${node.offsetClause.accept(this)}`;
    }
    if (node.limitClause) {
      sql += ` ${node.limitClause.accept(this)}`;
    }
    return sql;
  }

  visitValuesInsertSource(node: ValuesInsertSource) {
    if (node.isDefault) {
      return ' DEFAULT VALUES';
    } else if (node.select) {
      return ` ${node.select.accept(this)}`;
    } else {
      return ` VALUES (${node.values.map(it => it.accept(this)).join(', ')})`;
    }
  }

  visitWhereClause(node: WhereClause) {
    return `WHERE ${node.conditionExpression.accept(this)}`;
  }

  visitLockClause(node: LockClause) {
    if (node.value === true) {
      return `for update`;
    } else if (node.value === false) {
      return 'lock in share mode';
    } else if (isString(node.value)) {
      return node.value;
    }
  }
}

