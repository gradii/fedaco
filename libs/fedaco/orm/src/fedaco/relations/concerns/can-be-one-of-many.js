import { isBlank, isFunction, isString } from '@gradii/check-type';
import { last } from 'ramda';
import { mapWithKeys, wrap } from '../../../helper/arr';

export function mixinCanBeOneOfMany(base) {
  return class _Self extends base {
    constructor() {
      super(...arguments);

      this._isOneOfMany = false;
    }

    addOneOfManySubQueryConstraints(query, column = null, aggregate = null) {
      throw new Error('not implement');
    }

    getOneOfManySubQuerySelectColumns() {
      throw new Error('not implement');
    }

    addOneOfManyJoinSubQueryConstraints(join) {
      throw new Error('not implement');
    }

    ofMany(column = 'id', aggregate = 'MAX', relation) {
      this._isOneOfMany = true;
      this._relationName = relation;
      const keyName = this._query.getModel().getKeyName();
      const columns = isString(column) ? {
        [column]: aggregate,
        [keyName]: aggregate
      } : column;
      if (!(keyName in columns)) {
        columns[keyName] = 'MAX';
      }
      let closure;
      if (isFunction(aggregate)) {
        closure = aggregate;
      }
      let previous;
      const columnsEntries = Object.entries(columns);
      const lastColumn = columnsEntries[columnsEntries.length - 1][0];
      for (const [column, aggregate] of columnsEntries) {

        if (!['min', 'max'].includes(aggregate.toLowerCase())) {
          throw new Error(`InvalidArgumentException(
            '"Invalid aggregate [{$aggregate}] used within ofMany relation. Available aggregates: MIN, MAX"')`);
        }

        const subQuery = this._newOneOfManySubQuery(this._getOneOfManySubQuerySelectColumns(), column, aggregate);
        if (previous !== undefined) {
          this._addOneOfManyJoinSubQuery(subQuery, previous['subQuery'], previous['column']);
        } else if (closure !== undefined) {
          closure(subQuery);
        }
        if (!(previous !== undefined)) {
          this._oneOfManySubQuery = subQuery;
        }
        if (lastColumn == column) {
          this._addOneOfManyJoinSubQuery(this._query, subQuery, column);
        }
        previous = {
          'subQuery': subQuery,
          'column': column
        };
      }
      this.addConstraints();
      return this;
    }

    latestOfMany(column = 'id', relation = null) {
      return this.ofMany(mapWithKeys(wrap(column), (column) => {
        return { column: 'MAX' };
      }), 'MAX', relation);
    }

    oldestOfMany(column = 'id', relation = null) {
      return this.ofMany(mapWithKeys(wrap(column), (column) => {
        return { column: 'MIN' };
      }), 'MIN', relation);
    }


    _newOneOfManySubQuery(groupBy, column = null, aggregate = null) {
      const subQuery = this.query.getModel().newQuery();
      for (const group of wrap(groupBy)) {
        subQuery.groupBy(this.qualifyRelatedColumn(group));
      }
      if (!isBlank(column)) {
        subQuery.selectRaw(aggregate + '(' + subQuery.getQuery().grammar.wrap(column) + ') as ' + subQuery.getQuery().grammar.wrap(column));
      }

      this.addOneOfManySubQueryConstraints(subQuery, groupBy, column, aggregate);
      return subQuery;
    }

    _addOneOfManyJoinSubQuery(parent, subQuery, on) {


    }

    _mergeOneOfManyJoinsTo(query) {
      query.getQuery().beforeQueryCallbacks = this.query.getQuery().beforeQueryCallbacks;
      query.applyBeforeQueryCallbacks();
    }

    _getRelationQuery() {
      return this.isOneOfMany() ? this._oneOfManySubQuery : this._query;
    }

    getOneOfManySubQuery() {
      return this._oneOfManySubQuery;
    }

    qualifySubSelectColumn(column) {
      return `${this.getRelationName()}.${last(column.split('.'))}`;
    }

    _qualifyRelatedColumn(column) {
      return column.includes('.') ? column : this._query.getModel().getTable() + '.' + column;
    }


    isOneOfMany() {
      return this._isOneOfMany;
    }

    getRelationName() {
      return this._relationName;
    }
  };
}
