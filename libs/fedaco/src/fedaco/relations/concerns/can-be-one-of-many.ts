/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, isFunction, isString, last } from '@gradii/nanofn';
import { wrap } from '../../../helper/arr';
import type { Constructor } from '../../../helper/constructor';
import type { JoinClauseBuilder } from '../../../query-builder/query-builder';
import type { FedacoBuilder } from '../../fedaco-builder';
import type { Model } from '../../model';
import type { MorphOneOrMany } from '../morph-one-or-many';

export interface CanBeOneOfMany {
  ofMany(column?: string | any[] | null, aggregate?: string | Function | null, relation?: string | null): this;

  /* Indicate that the relation is the latest single result of a larger one-to-many relationship. */
  latestOfMany(column?: string | any[] | null, relation?: string | null): this;

  /* Indicate that the relation is the oldest single result of a larger one-to-many relationship. */
  oldestOfMany(column?: string | any[] | null, relation?: string | null): this;

  /* Get a new query for the related model, grouping the query by the given column, often the foreign key of the relationship. */
  _newOneOfManySubQuery(groupBy: string | any[], column?: string | null, aggregate?: string | null): FedacoBuilder;

  /* Add the join subquery to the given query on the given column and the relationship's foreign key. */
  _addOneOfManyJoinSubQuery(parent: FedacoBuilder, subQuery: FedacoBuilder, on: string): void;

  /* Merge the relationship query joins to the given query builder. */
  _mergeOneOfManyJoinsTo(query: FedacoBuilder): void;

  /* Get the query builder that will contain the relationship constraints. */
  _getRelationQuery(): FedacoBuilder;

  /* Get the one of many inner join subselect builder instance. */
  getOneOfManySubQuery(): FedacoBuilder;

  /* Get the qualified column name for the one-of-many relationship using the subselect join query's alias. */
  _qualifySubSelectColumn(column: string): string;

  /* Qualify related column using the related table name if it is not already qualified. */
  _qualifyRelatedColumn(column: string): string;

  /* Determine whether the relationship is a one-of-many relationship. */
  isOneOfMany(): boolean;

  /* Get the name of the relationship. */
  getRelationName(): string;
}

export function mixinCanBeOneOfMany<T extends Constructor<any>>(base: T) {
  return class _Self extends base {
    /* Determines whether the relationship is one-of-many. */
    _isOneOfMany = false;
    /* The name of the relationship. */
    _relationName: string;
    /* The one of many inner join subselect query builder instance. */
    _oneOfManySubQuery?: FedacoBuilder;

    /* Add constraints for inner join subselect for one of many relationships. */
    public addOneOfManySubQueryConstraints(
      query: FedacoBuilder,
      column: string | null = null,
      aggregate: string | null = null,
    ) {
      throw new Error('not implement');
    }

    /* Get the columns the determine the relationship groups. */
    public getOneOfManySubQuerySelectColumns() {
      throw new Error('not implement');
    }

    /* Add join query constraints for one of many relationships. */
    public addOneOfManyJoinSubQueryConstraints(join: JoinClauseBuilder) {
      throw new Error('not implement');
    }

    /* Indicate that the relation is a single result of a larger one-to-many relationship. */
    public ofMany(column: string | any = 'id', aggregate: string | Function = 'MAX', relation: string): this {
      this._isOneOfMany = true;
      this._relationName = relation; // || this._getDefaultOneOfManyJoinAlias();
      const keyName = (this._query.getModel() as Model).GetKeyName();
      const columns = isString(column)
        ? {
            [column] : aggregate,
            [keyName]: aggregate,
          }
        : column;
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
      for (const [_column, _aggregate] of columnsEntries) {
        // @ts-ignore
        if (!['min', 'max'].includes(_aggregate.toLowerCase())) {
          throw new Error(
            `InvalidArgumentException Invalid aggregate [${_aggregate}] used within ofMany relation. ` +
              `Available aggregates: MIN, MAX`,
          );
        }
        // @ts-ignore
        const subQuery = this._newOneOfManySubQuery(this.getOneOfManySubQuerySelectColumns(), _column, _aggregate);
        if (previous !== undefined) {
          this._addOneOfManyJoinSubQuery(subQuery, previous['subQuery'], previous['column']);
        } else if (closure !== undefined) {
          closure(subQuery);
        }
        if (!(previous !== undefined)) {
          this._oneOfManySubQuery = subQuery;
        }
        if (lastColumn == _column) {
          this._addOneOfManyJoinSubQuery(this._query, subQuery, _column);
        }
        previous = {
          subQuery: subQuery,
          column  : _column,
        };
      }
      this.addConstraints();
      return this as unknown as any;
    }

    /* Indicate that the relation is the latest single result of a larger one-to-many relationship. */
    public latestOfMany(column: string[] | string = 'id', relation = '_latestOfMany'): this {
      return this.ofMany(
        wrap(column).reduce((prev, col: string) => {
          prev[col] = 'MAX';
          return prev;
        }, {}),
        'MAX',
        relation,
      );
    }

    /* Indicate that the relation is the oldest single result of a larger one-to-many relationship. */
    public oldestOfMany(column: string[] | string = 'id', relation = '_oldestOfMany'): this {
      return this.ofMany(
        wrap(column).reduce((prev, col: string) => {
          prev[col] = 'MIN';
          return prev;
        }, {}),
        'MIN',
        relation,
      );
    }

    /* Get the default alias for the one of many inner join clause. */
    // _getDefaultOneOfManyJoinAlias(relation: string) {
    //   return relation == this._query.getModel().getTable() ? relation + '_of_many' : relation;
    // }

    /* Get a new query for the related model, grouping the query by the given column, often the foreign key of the relationship. */
    _newOneOfManySubQuery(
      this: MorphOneOrMany & _Self,
      groupBy: string | any[],
      column?: string,
      aggregate?: string,
    ): FedacoBuilder {
      const subQuery = this._query.getModel().NewQuery();
      for (const group of wrap(groupBy)) {
        subQuery.groupBy(this._qualifyRelatedColumn(group));
      }
      if (!isBlank(column)) {
        subQuery.selectRaw(
          `${aggregate}(${subQuery.getQuery()._grammar.wrap(column)}) AS ${subQuery.getQuery()._grammar.wrap(column)}`,
        );
      }
      // @ts-ignore
      this.addOneOfManySubQueryConstraints(subQuery, groupBy, column, aggregate);
      return subQuery;
    }

    /* Add the join subquery to the given query on the given column and the relationship's foreign key. */
    _addOneOfManyJoinSubQuery(parent: FedacoBuilder, subQuery: FedacoBuilder, on: string): void {
      parent.beforeQuery((parent: FedacoBuilder) => {
        subQuery.applyBeforeQueryCallbacks();
        parent.joinSub(subQuery, this._relationName, (join: JoinClauseBuilder) => {
          join.on(this._qualifySubSelectColumn(on), '=', this._qualifyRelatedColumn(on));
          this.addOneOfManyJoinSubQueryConstraints(join);
        });
      });
    }

    /* Merge the relationship query joins to the given query builder. */
    _mergeOneOfManyJoinsTo(query: FedacoBuilder): void {
      query.getQuery()._beforeQueryCallbacks = this._query.getQuery()._beforeQueryCallbacks;
      query.applyBeforeQueryCallbacks();
    }

    /* Get the query builder that will contain the relationship constraints. */
    _getRelationQuery(): FedacoBuilder {
      return this.isOneOfMany() ? this._oneOfManySubQuery : this._query;
    }

    /* Get the one of many inner join subselect builder instance. */
    public getOneOfManySubQuery(): FedacoBuilder {
      return this._oneOfManySubQuery;
    }

    /* Get the qualified column name for the one-of-many relationship using the subselect join query's alias. */
    public _qualifySubSelectColumn(column: string): string {
      return `${this.getRelationName()}.${last(column.split('.'))}`;
    }

    /* Qualify related column using the related table name if it is not already qualified. */
    _qualifyRelatedColumn(column: string): string {
      return column.includes('.') ? column : (this._query.getModel() as Model).GetTable() + '.' + column;
    }

    /* Guess the "hasOne" relationship's name via backtrace. */
    // _guessRelationship() {
    //   return debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3)[2]['function'];
    // }

    /* Determine whether the relationship is a one-of-many relationship. */
    public isOneOfMany(): boolean {
      return this._isOneOfMany;
    }

    /* Get the name of the relationship. */
    public getRelationName(): string {
      return this._relationName;
    }
  };
}
