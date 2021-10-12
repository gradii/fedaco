import { BindingVariable } from '../../query/ast/binding-variable';
import { BetweenPredicateExpression } from '../../query/ast/expression/between-predicate-expression';
import { BinaryExpression } from '../../query/ast/expression/binary-expression';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { RawBindingExpression } from '../../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { raw } from '../ast-factory';

export function mixinHaving(base) {
  return class _Self extends base {
    addHaving(where, conjunction) {
      if (this._havings.length > 0) {
        if (conjunction === 'and' || conjunction === 'or') {
          const left = this._havings.pop();
          this._havings.push(new BinaryExpression(left, conjunction, where));
        } else if (conjunction === 'andX' || conjunction === 'orX') {
          throw new Error('not implement');
        } else {
          throw new Error(`conjunction error should be one of 'and' | 'or' | 'andX' | 'orX'`);
        }
      } else {
        this._havings.push(where);
      }
    }

    having(column, operator, value, conjunction = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (this._invalidOperator(operator)) {
        [value, operator] = [operator, '='];
      }

      const leftNode = SqlParser.createSqlParser(column).parseColumnAlias();
      const rightNode = (value instanceof RawExpression) ?

        value :
        new BindingVariable(raw(value), 'having');
      this.addHaving(
        new ComparisonPredicateExpression(leftNode, operator, rightNode), conjunction);
      return this;
    }

    havingBetween(column, values, conjunction = 'and', not = false) {
      const expression = SqlParser.createSqlParser(column).parseColumnAlias();
      const [left, right] = values;
      let leftBetween, rightBetween;
      leftBetween = left instanceof RawExpression ?
        left :
        new BindingVariable(raw(left), 'having');
      rightBetween = right instanceof RawExpression ?
        right :
        new BindingVariable(raw(right), 'having');
      this.addHaving(new BetweenPredicateExpression(expression, leftBetween, rightBetween, not), conjunction);
      return this;
    }

    havingRaw(sql, bindings = [], conjunction = 'and') {
      this.addHaving(
        new RawBindingExpression(raw(sql), bindings.map(it => new BindingVariable(raw(it), 'having'))), conjunction
      );
      return this;
    }

    orHaving(column, operator, value) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.having(column, operator, value, 'or');
    }

    orHavingRaw(sql, bindings = []) {
      return this.havingRaw(sql, bindings, 'or');
    }
  };
}
