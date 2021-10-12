import { isDate, isNumber, isString } from '@gradii/check-type';
import { format } from 'date-fns';
import { BindingVariable } from '../../query/ast/binding-variable';
import { ComparisonPredicateExpression } from '../../query/ast/expression/comparison-predicate-expression';
import { FunctionCallExpression } from '../../query/ast/expression/function-call-expression';
import { RawExpression } from '../../query/ast/expression/raw-expression';
import { SqlParser } from '../../query/parser/sql-parser';
import { createIdentifier } from '../ast-factory';

export function mixinWhereDate(base) {
  return class _Self extends base {

    _addDateBasedWhere(type, column, operator, value, conjunction = 'and') {
      const leftNode = SqlParser.createSqlParser(column).parseUnaryTableColumn();
      let rightNode;
      if (value instanceof RawExpression) {
        rightNode = value;
      } else {
        rightNode = new BindingVariable(new RawExpression(value), 'where');
      }
      this.addWhere(new ComparisonPredicateExpression(new FunctionCallExpression(createIdentifier(type), [leftNode]), operator, rightNode), conjunction);


      return this;
    }

    orWhereDate(column, operator, value) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereDate(column, operator, value, 'or');
    }

    orWhereDay(column, operator, value) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereDay(column, operator, value, 'or');
    }

    orWhereMonth(column, operator, value) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereMonth(column, operator, value, 'or');
    }

    orWhereTime(column, operator, value) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereTime(column, operator, value, 'or');
    }

    orWhereYear(column, operator, value) {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      return this.whereYear(column, operator, value, 'or');
    }

    whereDate(column, operator, value, conjunction = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (isDate(value)) {
        value = format(value, 'yyyy-MM-dd');
      }
      return this._addDateBasedWhere('Date', column, operator, value, conjunction);
    }

    whereDay(column, operator, value, conjunction = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (isDate(value)) {
        value = format(value, 'dd');
      }
      if (isString(value) || isNumber(value)) {

        value = `${value}`.padStart(2, '0');
      }
      return this._addDateBasedWhere('Day', column, operator, value, conjunction);
    }

    whereMonth(column, operator, value, conjunction = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (isDate(value)) {
        value = format(value, 'MM');
      }
      if (isString(value) || isNumber(value)) {

        value = `${value}`.padStart(2, '0');
      }
      return this._addDateBasedWhere('Month', column, operator, value, conjunction);
    }

    whereTime(column, operator, value, conjunction = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (isDate(value)) {
        value = format(value, 'hh:mm:ss');
      }
      return this._addDateBasedWhere('Time', column, operator, value, conjunction);
    }

    whereYear(column, operator, value, conjunction = 'and') {
      [value, operator] = this._prepareValueAndOperator(value, operator, arguments.length === 2);
      if (isDate(value)) {
        value = format(value, 'yyyy');
      }
      return this._addDateBasedWhere('Year', column, operator, value, conjunction);
    }
  };
}
