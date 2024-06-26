/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isAnyEmpty, isArray, isBlank, isNumber, isString } from '@gradii/nanofn';
import type { Constructor } from '../../helper/constructor';
import { snakeCase } from '@gradii/nanofn';
import { createTableColumn, raw, rawSqlBindings } from '../../query-builder/ast-factory';
import type { Builder } from '../../query-builder/builder';
import type { QueryBuilder } from '../../query-builder/query-builder';
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import type { BelongsTo } from '../relations/belongs-to';
import { MorphTo } from '../relations/morph-to';
import { Relation } from '../relations/relation';

export type RelationParam = { [key: string]: (q: FedacoBuilder) => void } | string;
export type RelationParams = RelationParam[] | RelationParam;

export interface QueriesRelationships {
  /*Add a relationship count / exists condition to the query.*/
  has(relation: Relation | string, operator?: string, count?: number, conjunction?: string,
      callback?: Function | null): this;

  /*Add nested relationship count / exists conditions to the query.

  Sets up recursive call to whereHas until we finish the nested relation.*/
  _hasNested(relations: string, operator?: string, count?: number, conjunction?: string,
             callback?: Function | null): this;

  /*Add a relationship count / exists condition to the query with an "or".*/
  orHas(relation: string, operator?: string, count?: number): this;

  /*Add a relationship count / exists condition to the query.*/
  doesntHave(relation: string, conjunction?: string, callback?: Function | null): this;

  /*Add a relationship count / exists condition to the query with an "or".*/
  orDoesntHave(relation: string): this;

  /*Add a relationship count / exists condition to the query with where clauses.*/
  whereHas(relation: string | Relation, callback?: ((q: FedacoBuilder) => void), operator?: string,
    count?: number): this;

  whereHas(relation: string | Relation, callback?: Function | null, operator?: string,
           count?: number): this;

  /*Add a relationship count / exists condition to the query with where clauses and an "or".*/
  orWhereHas(relation: string, callback?: ((q: FedacoBuilder) => void), operator?: string, count?: number): this;

  orWhereHas(relation: string, callback?: Function | null, operator?: string, count?: number): this;

  /*Add a relationship count / exists condition to the query with where clauses.*/
  whereDoesntHave(relation: string, callback?: ((q: FedacoBuilder) => void)): this;

  whereDoesntHave(relation: string, callback?: Function | null): this;

  /*Add a relationship count / exists condition to the query with where clauses and an "or".*/
  orWhereDoesntHave(relation: string, callback?: ((q: FedacoBuilder) => void) | null): this;

  orWhereDoesntHave(relation: string, callback?: Function | null): this;

  /*Add a polymorphic relationship count / exists condition to the query.*/
  hasMorph(relation: MorphTo | string, types: string[], operator?: string, count?: number,
           conjunction?: string, callback?: ((q: FedacoBuilder) => void) | null): this;

  hasMorph(relation: MorphTo | string, types: string[], operator?: string, count?: number,
           conjunction?: string, callback?: Function | null): this;

  /*Get the BelongsTo relationship for a single polymorphic type.*/
  _getBelongsToRelation(relation: MorphTo, type: string): BelongsTo;

  /*Add a polymorphic relationship count / exists condition to the query with an "or".*/
  orHasMorph(relation: MorphTo | string, types: string[], operator?: string, count?: number): this;

  /*Add a polymorphic relationship count / exists condition to the query.*/
  doesntHaveMorph(relation: MorphTo | string, types: string[], conjunction?: string,
                  callback?: ((q: FedacoBuilder) => void)): this;

  doesntHaveMorph(relation: MorphTo | string, types: string[], conjunction?: string,
                  callback?: Function): this;

  /*Add a polymorphic relationship count / exists condition to the query with an "or".*/
  orDoesntHaveMorph(relation: MorphTo | string, types: string[]): this;

  /*Add a polymorphic relationship count / exists condition to the query with where clauses.*/
  whereHasMorph(relation: MorphTo | string, types: string[], callback?: ((q: FedacoBuilder) => void) | null,
                operator?: string, count?: number): this;

  whereHasMorph(relation: MorphTo | string, types: string[], callback?: Function | null,
                operator?: string, count?: number): this;

  /*Add a polymorphic relationship count / exists condition to the query with where clauses and an "or".*/
  orWhereHasMorph(relation: MorphTo | string, types: string[], callback?: ((q: FedacoBuilder) => void) | null,
                  operator?: string, count?: number): this;

  orWhereHasMorph(relation: MorphTo | string, types: string[], callback?: Function | null,
                  operator?: string, count?: number): this;

  /*Add a polymorphic relationship count / exists condition to the query with where clauses.*/
  whereDoesntHaveMorph(relation: MorphTo | string, types: string[],
                       callback?: ((q: FedacoBuilder) => void) | null): this;

  whereDoesntHaveMorph(relation: MorphTo | string, types: string[],
                       callback?: Function | null): this;

  /*Add a polymorphic relationship count / exists condition to the query with where clauses and an "or".*/
  orWhereDoesntHaveMorph(relation: MorphTo | string, types: string[],
                         callback?: ((q: FedacoBuilder) => void) | null): this;

  orWhereDoesntHaveMorph(relation: MorphTo | string, types: string[],
                         callback?: Function | null): this;

  /*Add subselect queries to include an aggregate value for a relationship.*/
  withAggregate(relations: any, column: string, func?: string): this;

  /*Add subselect queries to count the relations.*/
  withCount(relations: Record<string, ((q: Relation) => void)>): this;

  withCount(relations: any): this;

  /*Add subselect queries to include the max of the relation's column.*/
  withMax(relation: string | any[], column: string): this;

  /*Add subselect queries to include the min of the relation's column.*/
  withMin(relation: string | any[], column: string): this;

  /*Add subselect queries to include the sum of the relation's column.*/
  withSum(relation: string | any[], column: string): this;

  /*Add subselect queries to include the average of the relation's column.*/
  withAvg(relation: string | any[], column: string): this;

  /*Add subselect queries to include the existence of related models.*/
  withExists(relation: RelationParams): this;

  /*Add the "has" condition where clause to the query.*/
  addHasWhere(hasQuery: FedacoBuilder, relation: Relation, operator: string, count: number,
              conjunction: string): this;

  /*Merge the where constraints from another query to the current query.*/
  mergeConstraintsFrom(from: FedacoBuilder): FedacoBuilder;

  /*Add a sub-query count clause to this query.*/
  addWhereCountQuery(query: Builder, operator?: string, count?: number, conjunction?: string): this;

  /*Get the "has relation" base query instance.*/
  _getRelationWithoutConstraints<T extends Relation>(relation: string): T;

  /*Check if we can run an "exists" query to optimize performance.*/
  _canUseExistsForExistenceCheck(operator: string, count: number): boolean;
}

export type QueriesRelationshipsCtor = Constructor<QueriesRelationships>;

export function mixinQueriesRelationships<T extends Constructor<any>>(base: T): QueriesRelationshipsCtor & T {
  return class _Self extends base {

    /*Add a relationship count / exists condition to the query.*/
    public has(relation: Relation | string,
               operator    = '>=',
               count       = 1,
               conjunction = 'and',
               callback?: ((q: FedacoBuilder) => void) | Function): this {
      if (isString(relation)) {
        if (relation.includes('.')) {
          return this._hasNested(relation, operator, count, conjunction, callback);
        }
        const ins = this._getRelationWithoutConstraints(relation);
        if (isBlank(ins)) {
          throw new Error(`the relation [${relation}] can't acquired. try to define a relation like
@HasManyColumn()
public readonly ${relation};
`);
        }
        relation = ins;
      }

      if (relation instanceof MorphTo) {
        return this.hasMorph(relation, ['*'], operator, count, conjunction, callback);
      }
      const method = this._canUseExistsForExistenceCheck(operator, count) ?
        'getRelationExistenceQuery' :
        'getRelationExistenceCountQuery';

      const hasQuery: FedacoBuilder = (relation as any)[method](
        (relation as Relation).getRelated().NewQueryWithoutRelationships(), this);

      if (callback) {
        hasQuery.callScope(callback as any);
      }
      return this._addHasWhere(hasQuery, relation as Relation, operator, count, conjunction);
    }

    /*Add nested relationship count / exists conditions to the query.

    Sets up recursive call to whereHas until we finish the nested relation.*/
    _hasNested(relations: string,
               operator                  = '>=',
               count                     = 1,
               conjunction               = 'and',
               callback: Function | null = null): this {
      const splitRelations = relations.split('.');
      const doesntHave     = operator === '<' && count === 1;
      if (doesntHave) {
        operator = '>=';
        count    = 1;
      }
      const closure = (q: FedacoBuilder) => {
        splitRelations.length > 1 ?
          q.whereHas(splitRelations.shift(), closure) :
          q.has(splitRelations.shift(), operator, count, 'and', callback);
      };
      return this.has(splitRelations.shift(), doesntHave ? '<' : '>=', 1, conjunction, closure);
    }

    /*Add a relationship count / exists condition to the query with an "or".*/
    public orHas(relation: string, operator = '>=', count = 1): this {
      return this.has(relation, operator, count, 'or');
    }

    /*Add a relationship count / exists condition to the query.*/
    public doesntHave(relation: string, conjunction = 'and',
                      callback: Function | null     = null): this {
      return this.has(relation, '<', 1, conjunction, callback);
    }

    /*Add a relationship count / exists condition to the query with an "or".*/
    public orDoesntHave(relation: string): this {
      return this.doesntHave(relation, 'or');
    }

    /*Add a relationship count / exists condition to the query with where clauses.*/
    public whereHas(relation: Relation | string,
                    callback: Function | null = null,
                    operator                  = '>=',
                    count                     = 1): this {
      return this.has(relation, operator, count, 'and', callback);
    }

    /*Add a relationship count / exists condition to the query with where clauses and an "or".*/
    public orWhereHas(relation: Relation | string,
                      callback: Function | null = null,
                      operator                  = '>=',
                      count                     = 1): this {
      return this.has(relation, operator, count, 'or', callback);
    }

    /*Add a relationship count / exists condition to the query with where clauses.*/
    public whereDoesntHave(relation: string, callback: Function | null = null): this {
      return this.doesntHave(relation, 'and', callback);
    }

    /*Add a relationship count / exists condition to the query with where clauses and an "or".*/
    public orWhereDoesntHave(relation: string, callback: Function | null = null): this {
      return this.doesntHave(relation, 'or', callback);
    }

    /*Add a polymorphic relationship count / exists condition to the query.*/
    public hasMorph(relation: MorphTo | string,
                    types: string[],
                    operator                  = '>=',
                    count                     = 1,
                    conjunction               = 'and',
                    callback: Function | null = null): this {
      if (isString(relation)) {
        relation = this._getRelationWithoutConstraints(relation) as unknown as MorphTo;
      }
      // types eq ['*']
      if (types.length === 1 && types[0] === '*') {
        types = this.model.newModelQuery().distinct().pluck(
          (relation as MorphTo).getMorphType()
        ).filter().all();
      }

      const morphedTypes = types.map(type => {
        return Relation.getMorphedModel(type) ?? type;
      });

      return this.where((query: FedacoBuilder) => {
        for (const type of morphedTypes) {
          query.orWhere((q: FedacoBuilder) => {
            const belongsTo: BelongsTo = this._getBelongsToRelation(relation as MorphTo,
              type) as unknown as BelongsTo;
            if (callback) {
              callback = (__q: FedacoBuilder) => {
                return callback(__q, type);
              };
            }
            q.where(this.qualifyColumn(
              (relation as MorphTo).getMorphType()), '=', new type().getMorphClass()
            ).whereHas(belongsTo, callback, operator, count);
          });
        }
      }, null, null, conjunction);
    }

    /*Get the BelongsTo relationship for a single polymorphic type.*/
    _getBelongsToRelation(relation: MorphTo, type: string): BelongsTo {
      const belongsTo: BelongsTo = Relation.noConstraints(() => {
        return this.model.belongsTo(type, relation.getForeignKeyName(), relation.getOwnerKeyName());
      });
      belongsTo.getQuery().mergeConstraintsFrom(relation.getQuery());
      return belongsTo;
    }

    /*Add a polymorphic relationship count / exists condition to the query with an "or".*/
    public orHasMorph(relation: MorphTo | string,
                      types: string[],
                      operator = '>=',
                      count    = 1): this {
      return this.hasMorph(relation, types, operator, count, 'or');
    }

    /*Add a polymorphic relationship count / exists condition to the query.*/
    public doesntHaveMorph(relation: MorphTo | string, types: string[],
                           conjunction               = 'and',
                           callback: Function | null = null): this {
      return this.hasMorph(relation, types, '<', 1, conjunction, callback);
    }

    /*Add a polymorphic relationship count / exists condition to the query with an "or".*/
    public orDoesntHaveMorph(relation: MorphTo | string, types: string[]): this {
      return this.doesntHaveMorph(relation, types, 'or');
    }

    /*Add a polymorphic relationship count / exists condition to the query with where clauses.*/
    public whereHasMorph(relation: MorphTo | string, types: string[],
                         callback: Function | null = null, operator = '>=',
                         count                                      = 1): this {
      return this.hasMorph(relation, types, operator, count, 'and', callback);
    }

    /*Add a polymorphic relationship count / exists condition to the query with where clauses and an "or".*/
    public orWhereHasMorph(relation: MorphTo | string, types: string[],
                           callback: Function | null = null,
                           operator                  = '>=',
                           count                     = 1): this {
      return this.hasMorph(relation, types, operator, count, 'or', callback);
    }

    /*Add a polymorphic relationship count / exists condition to the query with where clauses.*/
    public whereDoesntHaveMorph(relation: MorphTo | string, types: string[],
                                callback: Function | null = null): this {
      return this.doesntHaveMorph(relation, types, 'and', callback);
    }

    /*Add a polymorphic relationship count / exists condition to the query with where clauses and an "or".*/
    public orWhereDoesntHaveMorph(relation: MorphTo | string, types: string[],
                                  callback: Function | null = null): this {
      return this.doesntHaveMorph(relation, types, 'or', callback);
    }

    /*Add subselect queries to include an aggregate value for a relationship.*/
    public withAggregate(this: FedacoBuilder & _Self, relations: RelationParams, column: string,
                         func: string = null): FedacoBuilder {
      if (isAnyEmpty(relations)) {
        return this;
      }
      if (!this.getQuery()._columns.length) {
        this.getQuery().select(createTableColumn(this.getQuery()._from, '*'));
      }
      relations = isArray(relations) ? relations : [relations];
      let name: string, constraints: any;
      for ([name, constraints] of Object.entries(this._parseWithRelations(relations))) {
        const segments = name.split(' ');
        let alias;
        if (segments.length === 3 && segments[1].toLowerCase() === 'as') {
          [name, alias] = [segments[0], segments[2]];
        }
        const relation = this._getRelationWithoutConstraints(name);
        let expression;
        if (func) {
          // todo check query from eq query from
          let hashedColumn: string;
          if (
            this.getModel()._connection === relation.getQuery().getModel()._connection &&
            this.getModel().GetTable() === relation.getQuery().getModel().GetTable()
          ) {
            hashedColumn = `${relation.getRelationCountHash(false)}.${column}`;
          } else {
            hashedColumn = column;
          }

          const wrappedColumn = this.getQuery().getGrammar().wrap(
            column === '*' ? column :
              relation.getRelated().QualifyColumn(hashedColumn)
          );

          expression = func === 'exists' ? wrappedColumn : `${func}(${wrappedColumn})`;
        } else {
          expression = column;
        }
        const query = relation.getRelationExistenceQuery(
          relation.getRelated().NewQuery(), this as unknown as FedacoBuilder, raw(expression)
        ); // .setBindings([], 'select');
        query.callScope(constraints);

        const queryBuilder: QueryBuilder = query.mergeConstraintsFrom(relation.getQuery()).toBase();
        queryBuilder._orders             = [];
        queryBuilder._bindings['order']  = [];
        if (queryBuilder._columns.length > 1) {
          queryBuilder._columns            = [queryBuilder._columns[0]];
          queryBuilder._bindings['select'] = [];
        }
        alias = alias ?? snakeCase(
          `${name} ${func} ${column}`.replace(/^[0-9A-Za-z]\s+_/u, '')
        );
        if (func === 'exists') {
          const sql = query.toSql();
          this.selectRaw(
            `exists(${sql.result}) as ${this.getQuery()._grammar.wrap(alias)}`,
            sql.bindings
          ).withCasts({[alias]: 'boolean'});

          // this.select(
          //   new ColumnReferenceExpression(
          //     new ExistsPredicateExpression(
          //       new NestedExpression('select', query, []),
          //     ),
          //     createIdentifier(alias)
          //   )
          // ).withCasts({[alias]: 'boolean'});
        } else {
          this.selectSub(func ? queryBuilder : queryBuilder.limit(1), alias);
        }
      }
      return this;
    }

    /*Add subselect queries to count the relations.*/
    public withCount(...relations: RelationParam[]): FedacoBuilder;
    public withCount(this: FedacoBuilder & _Self,
                     relations: RelationParam | RelationParams): FedacoBuilder {
      return this.withAggregate(isArray(relations) ? relations : [...arguments], '*', 'count');
    }

    /*Add subselect queries to include the max of the relation's column.*/
    public withMax(this: FedacoBuilder & _Self, relation: RelationParams,
                   column: string): FedacoBuilder {
      return this.withAggregate(relation, column, 'max');
    }

    /*Add subselect queries to include the min of the relation's column.*/
    public withMin(this: FedacoBuilder & _Self, relation: RelationParams,
                   column: string): FedacoBuilder {
      return this.withAggregate(relation, column, 'min');
    }

    /*Add subselect queries to include the sum of the relation's column.*/
    public withSum(this: FedacoBuilder & _Self, relation: RelationParams,
                   column: string): FedacoBuilder {
      return this.withAggregate(relation, column, 'sum');
    }

    /*Add subselect queries to include the average of the relation's column.*/
    public withAvg(this: FedacoBuilder & _Self, relation: RelationParams,
                   column: string): FedacoBuilder {
      return this.withAggregate(relation, column, 'avg');
    }

    /*Add subselect queries to include the existence of related models.*/
    public withExists(this: FedacoBuilder & _Self, relation: RelationParams): FedacoBuilder {
      return this.withAggregate(relation, '*', 'exists');
    }

    /*Add the "has" condition where clause to the query.*/
    _addHasWhere(hasQuery: FedacoBuilder,
                 relation: Relation, operator: string,
                 count: number,
                 conjunction: string): this {
      hasQuery.mergeConstraintsFrom(relation.getQuery());
      return this._canUseExistsForExistenceCheck(operator, count) ?
        this.addWhereExistsQuery(hasQuery.toBase(), conjunction, operator === '<' && count === 1) :
        this._addWhereCountQuery(hasQuery.toBase(), operator, count, conjunction);
    }

    /*Merge the where constraints from another query to the current query.*/
    public mergeConstraintsFrom(from: FedacoBuilder): FedacoBuilder {
      const whereBindings = from.getQuery().getRawBindings()['where'] ?? [];
      const fb            = this.withoutGlobalScopes(from.removedScopes());
      fb.getQuery().mergeWheres(
        from.getQuery()._wheres,
        whereBindings
      );
      return fb;
    }

    /*Add a sub-query count clause to this query.*/
    _addWhereCountQuery(query: QueryBuilder,
                        operator    = '>=',
                        count       = 1,
                        conjunction = 'and'): this {
      // must call to sql first
      const sql      = query.toSql();
      const bindings = query.getBindings();
      return this.whereColumn(rawSqlBindings('(' + sql + ')', bindings), operator,
        isNumber(count) ? raw(count) : count, conjunction);
    }

    /*Get the "has relation" base query instance.*/
    _getRelationWithoutConstraints(relation: string): Relation {
      return Relation.noConstraints(() => {
        return (this.getModel() as Model).NewRelation(relation);
      });
    }

    /*Check if we can run an "exists" query to optimize performance.*/
    _canUseExistsForExistenceCheck(operator: string, count: number): boolean {
      return (operator === '>=' || operator === '<') && count === 1;
    }

  };
}

