/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ColumnReferenceExpression } from '../query/ast/column-reference-expression';
import { RawBindingExpression } from '../query/ast/expression/raw-binding-expression';
import { RawExpression } from '../query/ast/expression/raw-expression';
import { AggregateFragment } from '../query/ast/fragment/aggregate-fragment';
import { JoinFragment } from '../query/ast/fragment/join-fragment';
import { UnionFragment } from '../query/ast/fragment/union-fragment';
import { FromTable } from '../query/ast/from-table';
import { JoinExpression } from '../query/ast/join-expression';
import { JoinedTable } from '../query/ast/joined-table';
import { OrderByElement } from '../query/ast/order-by-element';
import { GrammarInterface } from './grammar.interface';
declare const Builder_base: import('./mixins/join').QueryBuilderJoinCtor &
    import('./mixins/order-by').QueryBuilderOrderByCtor &
    import('./mixins/group-by').QueryBuilderGroupByCtor &
    import('./mixins/having').QueryBuilderHavingCtor &
    import('./mixins/limit-offset').QueryBuilderLimitOffsetCtor &
    import('./mixins/union').QueryBuilderUnionCtor &
    import('./mixins/where-json').WhereJsonCtor &
    import('./mixins/where-date').WhereDateCtor &
    import('./mixins/aggregate').QueryBuilderAggregateCtor &
    import('./mixins/where-predicate').WherePredicateCtor &
    import('./mixins/where-common').WhereCommonCtor &
    import('./mixins/build-query').BuildQueriesCtor & {
        new (): {};
    };
export declare abstract class Builder extends Builder_base {
    _grammar: GrammarInterface;
    _unifyBindings: [];
    _bindings: {
        [key: string]: any[];
    };
    _aggregate: AggregateFragment;
    _columns: Array<
        ColumnReferenceExpression | RawBindingExpression | RawExpression
    >;
    _distinct: boolean | any[];
    _from: FromTable;
    _joins: (JoinedTable | JoinExpression | JoinFragment)[];
    _wheres: any[];
    _groups: any[];
    _havings: any[];
    _orders: (OrderByElement | RawBindingExpression | RawExpression)[];
    _limit: number;
    _offset: number;
    _unions: UnionFragment[];
    _unionLimit: number;
    _unionOffset: number;
    _unionOrders: any[];
    _lock: string | boolean;

    _beforeQueryCallbacks: Array<(...args: any[]) => any>;
}
export {};
