import { isFunction, isString } from '@gradii/check-type';
import { JoinFragment } from '../../query/ast/fragment/join-fragment';
import { JoinExpression } from '../../query/ast/join-expression';
import { JoinOnExpression } from '../../query/ast/join-on-expression';
import { TableReferenceExpression } from '../../query/ast/table-reference-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { bindingVariable } from '../ast-factory';

export function mixinJoin(base) {
  return class _Self extends base {
    join(table, first, operator, second, type = 'inner', where = false) {
      if (isFunction(first)) {
        const join = this._newJoinClause(this, type, table);
        first(join);
        this._joins.push(new JoinFragment(join));
        return this;
      }
      if (arguments.length === 1) {
        if (isString(table)) {
          const ast = SqlParser.createSqlParser(table).parseJoin();
          this._joins.push(ast);
        } else {
          throw new Error('invalid table name');
        }
      } else if (arguments.length === 2) {
      } else if (arguments.length === 3 || arguments.length === 4 ||
        arguments.length === 5 || arguments.length === 6) {
        if (arguments.length === 3) {
          second = operator;
          operator = '=';
        }
        let tableNode;
        if (isString(table)) {
          tableNode = SqlParser.createSqlParser(table).parseTableAlias();
        } else if (table instanceof TableReferenceExpression) {
          tableNode = table;
        } else {
          throw new Error('invalid table type');
        }
        let left, right;
        if (this.isQueryable(first)) {
          const join = this._newJoinClause(this, type, tableNode);
          if (isFunction(first)) {
            first(join);
            left = new JoinFragment(join);
          } else {
            throw new Error('invalid join');
          }
        } else {
          left = SqlParser.createSqlParser(first).parseUnaryTableColumn();
        }
        if (where) {
          right = bindingVariable(second, 'join');
        } else if (isString(second)) {
          right = SqlParser.createSqlParser(second).parseUnaryTableColumn();
        } else {
        }
        this._joins.push(new JoinExpression(type, tableNode, new JoinOnExpression(left, operator, right)));
      }
      return this;
    }

    joinWhere(table, first, operator, second, type = 'inner') {
      return this.join(table, first, operator, second, type, true);
    }

    joinSub(query, as, first, operator = null, second = null, type = 'inner', where = false) {
      const node = this._createSubQuery('join', query);
      const expression = new TableReferenceExpression(node, as ? SqlParser.createSqlParser(as).parseUnaryTableColumn() : undefined);
      return this.join(expression, first, operator, second, type, where);
    }

    leftJoin(table, first, operator = null, second = null) {
      return this.join(table, first, operator, second, 'left');
    }

    leftJoinWhere(table, first, operator, second) {
      return this.joinWhere(table, first, operator, second, 'left');
    }

    leftJoinSub(query, as, first, operator = null, second = null) {
      return this.joinSub(query, as, first, operator, second, 'left');
    }

    rightJoin(table, first, operator = null, second = null) {
      return this.join(table, first, operator, second, 'right');
    }

    rightJoinWhere(table, first, operator, second) {
      return this.joinWhere(table, first, operator, second, 'right');
    }

    rightJoinSub(query, as, first, operator = null, second = null) {
      return this.joinSub(query, as, first, operator, second, 'right');
    }

    crossJoin(table, first, operator, second) {
      if (first) {
        return this.join(table, first, operator, second, 'cross');
      }
      this._joins.push(new JoinFragment(this._newJoinClause(this, 'cross', table)));
      return this;
    }
  };
}
