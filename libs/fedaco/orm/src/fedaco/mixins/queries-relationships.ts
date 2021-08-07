import {
  isAnyEmpty,
  isArray,
  isBlank
} from '@gradii/check-type';
import { Constructor } from '../../helper/constructor';
import {
  lowerCase,
  snakeCase
} from '../../helper/str';
import { FedacoBuilder } from '../fedaco-builder';

export interface QueriesRelationShips {
  withCount(relations: any): this
}

export type QueriesRelationShipsCtor = Constructor<QueriesRelationShips>;

export function mixinQueriesRelationShips<T extends Constructor<any>>(base: T): QueriesRelationShipsCtor & T {
  return class _Self extends base {

    withCount(relations: any) {
      if (isAnyEmpty(relations)) {
        return this;
      }
      if (isBlank(this._query.columns)) {
        this.query.select([this._query.from + '.*']);
      }
      relations = isArray(relations) ? relations : arguments;
      for (let [name, constraints] of Object.entries(this.parseWithRelations(relations))) {
        const segments = name.split(' ');
        let alias;
        if (segments.length === 3 && lowerCase(segments[1]) === 'as') {
          [name, alias] = [segments[0], segments[2]];
        }
        const relation = this.getRelationWithoutConstraints(name);
        let query      = relation.getRelationExistenceCountQuery(relation.getRelated().newQuery(), this);
        query.callScope(constraints);
        query        = query.mergeConstraintsFrom(relation.getQuery()).toBase();
        query.orders = null;
        query.setBindings([], 'order');
        if (query.columns.length > 1) {
          query.columns            = [query.columns[0]];
          query.bindings['select'] = [];
        }
        const column = alias ?? snakeCase(name + '_count');
        this.selectSub(query, column);
      }
      return this;
    }
  };
}

