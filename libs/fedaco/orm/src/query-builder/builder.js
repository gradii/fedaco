import { mixinAggregate } from './mixins/aggregate';
import { mixinBuildQueries } from './mixins/build-query';
import { mixinGroupBy } from './mixins/group-by';
import { mixinHaving } from './mixins/having';
import { mixinJoin } from './mixins/join';
import { mixinLimitOffset } from './mixins/limit-offset';
import { mixinOrderBy } from './mixins/order-by';
import { mixinUnion } from './mixins/union';
import { mixinWhereCommon } from './mixins/where-common';
import { mixinWhereDate } from './mixins/where-date';
import { mixinWherePredicate } from './mixins/where-predicate';

export class Builder extends mixinJoin(mixinOrderBy(mixinGroupBy(mixinHaving(mixinLimitOffset(mixinUnion(mixinWhereDate(mixinAggregate(mixinWherePredicate(mixinWhereCommon(mixinBuildQueries(class {
}))))))))))) {
  constructor() {
    super(...arguments);

    this._bindings = {
      'select': [],
      'updateJoin': [],
      'update': [],
      'from': [],
      'join': [],
      'where': [],
      'groupBy': [],
      'having': [],
      'order': [],
      'union': [],
      'unionOrder': [],
      'insert': []
    };

    this._columns = [];

    this._distinct = false;

    this._joins = [];

    this._wheres = [];

    this._groups = [];

    this._havings = [];

    this._orders = [];

    this._unions = [];

    this._unionOrders = [];
  }
}
