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
declare const Builder_base: import("@gradii/fedaco/src/query-builder/mixins/join").QueryBuilderJoinCtor & import("@gradii/fedaco/src/query-builder/mixins/order-by").QueryBuilderOrderByCtor & import("@gradii/fedaco/src/query-builder/mixins/group-by").QueryBuilderGroupByCtor & import("@gradii/fedaco/src/query-builder/mixins/having").QueryBuilderHavingCtor & import("@gradii/fedaco/src/query-builder/mixins/limit-offset").QueryBuilderLimitOffsetCtor & import("@gradii/fedaco/src/query-builder/mixins/union").QueryBuilderUnionCtor & import("@gradii/fedaco/src/query-builder/mixins/where-json").WhereJsonCtor & import("@gradii/fedaco/src/query-builder/mixins/where-date").WhereDateCtor & import("@gradii/fedaco/src/query-builder/mixins/aggregate").QueryBuilderAggregateCtor & import("@gradii/fedaco/src/query-builder/mixins/where-predicate").WherePredicateCtor & import("@gradii/fedaco/src/query-builder/mixins/where-common").WhereCommonCtor & import("@gradii/fedaco/src/query-builder/mixins/build-query").BuildQueriesCtor & {
    new (): {};
};
export declare abstract class Builder extends Builder_base {
    _grammar: GrammarInterface;
    _unifyBindings: [];
    _bindings: {
        [key: string]: any[];
    };
    _aggregate: AggregateFragment;
    _columns: Array<ColumnReferenceExpression | RawBindingExpression | RawExpression>;
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
    /**
     * The callbacks that should be invoked before the query is executed.
     * cloned
     */
    _beforeQueryCallbacks: Array<(...args: any[]) => any>;
}
export {};
