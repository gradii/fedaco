import { BindingVariable } from '../../query/ast/binding-variable';
import { BetweenPredicateExpression } from '../../query/ast/expression/between-predicate-expression';
import { ExistsPredicateExpression } from '../../query/ast/expression/exists-predicate-expression';
import { InPredicateExpression } from '../../query/ast/expression/in-predicate-expression';
import { NullPredicateExpression } from '../../query/ast/expression/null-predicate-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { NestedExpression } from '../../query/ast/fragment/nested-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { raw } from '../ast-factory';
import { wrapToArray } from '../ast-helper';

export function mixinWherePredicate(base) {
  return class _Self extends base {

    addWhereExistsQuery(query, conjunction = 'and', not = false) {


      this.addWhere(new ExistsPredicateExpression(new NestedExpression('where', query, []), not), conjunction);
      return this;
    }

    orWhereBetween(column, values, not = false) {
      return this.whereBetween(column, values, 'or', not);
    }

    orWhereExists(callback, not = false) {
      return this.whereExists(callback, 'or', not);
    }

    orWhereIn(column, values, not = false) {
      return this.whereIn(column, values, 'or', not);
    }

    orWhereIntegerInRaw(column, values) {
      return this.whereIntegerInRaw(column, values, 'or');
    }

    orWhereIntegerNotInRaw(column, values) {
      return this.whereIntegerNotInRaw(column, values, 'or');
    }

    orWhereNotBetween(column, values) {
      return this.whereNotBetween(column, values, 'or');
    }

    orWhereNotExists(callback) {
      return this.orWhereExists(callback, true);
    }

    orWhereNotIn(column, values) {
      return this.whereNotIn(column, values, 'or');
    }

    orWhereNotNull(column) {
      return this.whereNull(column, 'or', true);
    }

    orWhereNull(column) {
      return this.whereNull(column, 'or');
    }

    whereBetween(column, values, conjunction = 'and', not = false) {
      const expression = SqlParser.createSqlParser(column).parseColumnAlias();
      const [left, right] = values;
      let leftBetween, rightBetween;
      leftBetween = left instanceof RawExpression ?
        left :
        new BindingVariable(new RawExpression(left), 'where');
      rightBetween = right instanceof RawExpression ?
        right :
        new BindingVariable(new RawExpression(right), 'where');
      this.addWhere(new BetweenPredicateExpression(expression, leftBetween, rightBetween, not), conjunction);


      return this;
    }

    whereExists(callback, boolean = 'and', not = false) {
      const query = this._forSubQuery();
      callback(query);
      return this.addWhereExistsQuery(query, boolean, not);
    }

    whereIn(column, values, conjunction = 'and', not = false) {
      const expression = SqlParser.createSqlParser(column).parseUnaryTableColumn();
      let subQuery, valueArray = [];
      if (this.isQueryable(values)) {
        subQuery = this._createSubQuery('where', values);

      } else {
        valueArray = values.map(it => it instanceof RawExpression ? it : new BindingVariable(new RawExpression(it)));
      }
      this.addWhere(new InPredicateExpression(expression, valueArray, subQuery, not), conjunction);


      return this;
    }

    whereIntegerInRaw(column, values, conjunction = 'and', not = false) {
      return this.whereIn(column, values.map(it => {
        return raw(parseInt(it));
      }), conjunction, not);
    }

    whereIntegerNotInRaw(column, values, conjunction = 'and') {
      return this.whereIntegerInRaw(column, values, conjunction, true);
    }

    whereNotBetween(column, values, conjuction = 'and') {
      return this.whereBetween(column, values, conjuction, true);
    }

    whereNotExists(callback, boolean = 'and') {
      return this.whereExists(callback, boolean, true);
    }

    whereNotIn(column, values, conjuction = 'and') {
      return this.whereIn(column, values, conjuction, true);
    }

    whereNotNull(columns, boolean = 'and') {
      return this.whereNull(columns, boolean, true);
    }

    whereNull(columns, conjunction = 'and', not = false) {
      for (const column of wrapToArray(columns)) {
        const ast = SqlParser.createSqlParser(column).parseColumnAlias();
        this.addWhere(new NullPredicateExpression(ast, not), conjunction);
      }
      return this;
    }
  };
}
