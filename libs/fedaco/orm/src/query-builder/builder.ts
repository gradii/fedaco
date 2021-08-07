import { ColumnReferenceExpression } from '../query/ast/column-reference-expression';
import { RawBindingExpression } from '../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../query/ast/expression/raw-expression';
import { AggregateFragment } from '../query/ast/fragment/aggregate-fragment';
import { JoinFragment } from '../query/ast/fragment/join-fragment';
import { UnionFragment } from '../query/ast/fragment/union-fragment';
import { FromTable } from '../query/ast/from-table';
import { JoinExpression } from '../query/ast/join-expression';
import { JoinedTable } from '../query/ast/joined-table';
import { GrammarInterface } from './grammar.interface';
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


export abstract class Builder extends mixinJoin(
  mixinOrderBy(
    mixinGroupBy(
      mixinHaving(
        mixinLimitOffset(
          mixinUnion(
            mixinWhereDate(
              mixinAggregate(
                mixinWherePredicate(
                  mixinWhereCommon(
                    mixinBuildQueries(class {
                    })
                  )
                )
              )
            )
          )
        )
      )
    )
  )
) {
  /*The database query grammar instance.*/
  _grammar: GrammarInterface;

  _unifyBindings: [];

  /*The current query value bindings.*/
  _bindings: { [key: string]: any[] } = {
    'select'    : [],
    'updateJoin': [],
    'update'    : [],
    'from'      : [],
    'join'      : [],
    'where'     : [],
    'groupBy'   : [],
    'having'    : [],
    'order'     : [],
    'union'     : [],
    'unionOrder': [],
    'insert'    : []
  };
  /*An aggregate function and column to be run.*/
  _aggregate: AggregateFragment;
  /*The columns that should be returned.*/
  _columns: Array<ColumnReferenceExpression | RawBindingExpression | RawExpression> = [];
  /*Indicates if the query returns distinct results.

  Occasionally contains the columns that should be distinct.*/
  _distinct: boolean | any[] = false;
  /*The table which the query is targeting.*/
  _from: FromTable;
  /*The table joins for the query.*/
  _joins: (JoinedTable | JoinExpression | JoinFragment)[] = [];
  /*The where constraints for the query.*/
  _wheres: any[] = [];
  /*The groupings for the query.*/
  _groups: any[] = [];
  /*The having constraints for the query.*/
  _havings: any[] = [];
  /*The orderings for the query.*/
  _orders: any[] = [];
  /*The maximum number of records to return.*/
  _limit: number;
  /*The number of records to skip.*/
  _offset: number;
  /*The query union statements.*/
  _unions: UnionFragment[] = [];
  /*The maximum number of union records to return.*/
  _unionLimit: number;
  /*The number of union records to skip.*/
  _unionOffset: number;
  /*The orderings for the union query.*/
  _unionOrders: any[] = [];
  /*Indicates whether row locking is being used.*/
  _lock: string | boolean;
}