/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../helper/constructor';
import { BuildQueries, BuildQueriesCtor } from '../query-builder/mixins/build-query';
import { QueryBuilder } from '../query-builder/query-builder';
import { SqlNode } from '../query/sql-node';
import type { FedacoBuilderCallBack } from './fedaco-types';
import { ForwardCallToQueryBuilder, ForwardCallToQueryBuilderCtor } from './mixins/forward-call-to-query-builder';
import { GuardsAttributes } from './mixins/guards-attributes';
import { QueriesRelationShips } from './mixins/queries-relationships';
import { Model } from './model';
import { Relation } from './relations/relation';
import { Scope } from './scope';
export interface FedacoBuilder<T extends Model = Model> extends GuardsAttributes, QueriesRelationShips, Omit<BuildQueries, 'first' | 'latest' | 'oldest' | 'orWhere' | 'where'>, ForwardCallToQueryBuilder {
    first(columns?: any[] | string): Promise<T>;
    make(attributes: Record<string, any>): T;
    withGlobalScope(identifier: string, scope: Scope | FedacoBuilderCallBack): this;
    withoutGlobalScope(scope: string): this;
    withoutGlobalScopes(scopes?: any[] | null): this;
    removedScopes(): any[];
    /**
     * Add a where clause on the primary key to the query.
     */
    whereKey(id: any): this;
    whereKeyNot(id: any): this;
    /**
     * Add a basic where clause to the query.
     */
    where(column: FedacoBuilderCallBack | any[] | SqlNode | any): this;
    where(column: string | SqlNode | any, value: any): this;
    where(column: FedacoBuilderCallBack | string | any[] | SqlNode | any, operator?: any, value?: any, conjunction?: string): this;
    firstWhere(column: FedacoBuilderCallBack | string | any[] | SqlNode, operator?: any, value?: any, conjunction?: string): Promise<T>;
    orWhere(column: FedacoBuilderCallBack | any[] | string | SqlNode, operator?: any, value?: any): this;
    latest(column?: string): this;
    oldest(column?: string): this;
    hydrate(items: any[]): T[];
    fromQuery(query: string, bindings?: any[]): Promise<T[]>;
    /**
     * Find a model by its primary key.
     */
    find(id: string | number, columns?: any[]): Promise<T>;
    find(id: any, columns?: any[]): Promise<T>;
    find(id: any[], columns?: any[]): Promise<T[]>;
    /**
     * Find multiple models by their primary keys.
     */
    findMany(ids: any[], columns?: any[]): Promise<T[]>;
    findOrFail<P extends (any[] | any)>(id: P, columns?: any[]): Promise<P extends any[] ? T[] : T>;
    findOrNew(id: any, columns?: any[]): Promise<T>;
    firstOrNew(attributes: any, values?: any): Promise<T>;
    firstOrCreate(attributes: any, values?: any): Promise<T>;
    updateOrCreate(attributes: any, values: Record<string, any>): Promise<T>;
    firstOrFail(columns?: any[]): Promise<T>;
    firstOr(columns?: FedacoBuilderCallBack | any[], callback?: FedacoBuilderCallBack | null): Promise<T>;
    value<K extends keyof T>(column: K): Promise<T[K] | void>;
    /**
     * Execute the query as a "select" statement.
     */
    get(columns?: string[] | string): Promise<T[]>;
    getModels(columns?: any[] | string): Promise<T[]>;
    eagerLoadRelations(models: any[]): Promise<T[]>;
    _eagerLoadRelation(models: any[], name: string, constraints: FedacoBuilderCallBack): Promise<T[]>;
    getRelation(name: string): Relation;
    _relationsNestedUnder(relation: string): Record<string, any>;
    _isNestedUnder(relation: string, name: string): boolean;
    pluck(column: string, key?: string): Promise<any[] | Record<string, any>>;
    paginate(page?: number, pageSize?: number, columns?: any[]): Promise<{
        items: any[];
        total: number;
        pageSize: number;
        page: number;
    }>;
    simplePaginate(page?: number, pageSize?: number, columns?: any[]): Promise<{
        items: any[];
        pageSize: number;
        page: number;
    }>;
    create(attributes?: Record<string, any>): Promise<T>;
    forceCreate(attributes: Record<string, any>): Promise<T>;
    update(values: any): Promise<any>;
    upsert(values: any[], uniqueBy: any[] | string, update?: any[]): Promise<any>;
    increment(column: string, amount?: number, extra?: any): Promise<any>;
    decrement(column: string, amount?: number, extra?: any): Promise<any>;
    _addUpdatedAtColumn(values: any): Record<string, any>;
    delete(): Promise<any>;
    forceDelete(): Promise<boolean>;
    onDelete(callback: FedacoBuilderCallBack): void;
    hasNamedScope(scope: string): boolean;
    scopes(scopes: any[] | string): this;
    applyScopes(): FedacoBuilder<T>;
    callScope(scope: (...args: any[]) => any | void, parameters?: any[]): any | void;
    callNamedScope(scope: string, parameters?: any[]): any | void;
    _addNewWheresWithinGroup(query: QueryBuilder, originalWhereCount: number): void;
    _groupWhereSliceForScope(query: QueryBuilder, whereSlice: any[]): void;
    pipe(...args: any[]): this;
    scope(scopeFn: string, ...args: any[]): this;
    whereScope(key: string, ...args: any[]): this;
    with(...relations: Array<{
        [key: string]: FedacoBuilderCallBack;
    } | string>): this;
    with(relations: {
        [key: string]: FedacoBuilderCallBack;
    }): this;
    with(relations: string[]): this;
    with(relations: string, callback?: FedacoBuilderCallBack): this;
    with(relations: {
        [key: string]: FedacoBuilderCallBack;
    } | string[] | string, callback?: FedacoBuilderCallBack | {
        [key: string]: FedacoBuilderCallBack;
    } | string): this;
    without(relations: any): this;
    withOnly(relations: any): this;
    newModelInstance(attributes?: Record<string, any>): T;
    _parseWithRelations(relations: any[]): {
        [key: string]: FedacoBuilderCallBack;
    };
    _createSelectWithConstraint(name: string): [string, FedacoBuilderCallBack];
    _addNestedWiths(name: string, results: Record<string, FedacoBuilderCallBack>): Record<string, FedacoBuilderCallBack>;
    withCasts(casts: any): this;
    getQuery(): QueryBuilder;
    setQuery(query: QueryBuilder): this;
    toBase(): QueryBuilder;
    getEagerLoads(): {
        [key: string]: FedacoBuilderCallBack;
    };
    setEagerLoads(eagerLoad: any): this;
    _defaultKeyName(): string;
    getModel(): T;
    setModel(model: T): this;
    qualifyColumn(column: string): string;
    qualifyColumns(columns: any[]): string[];
}
declare const FedacoBuilder_base: import("./mixins/guards-attributes").GuardsAttributesCtor<unknown> & import("./mixins/queries-relationships").QueriesRelationShipsCtor & Constructor<Omit<BuildQueriesCtor & ForwardCallToQueryBuilderCtor, "first">>;
export declare class FedacoBuilder<T extends Model = Model> extends FedacoBuilder_base {
    protected _query: QueryBuilder;
    protected static macros: any[];
    protected _model: T;
    protected _eagerLoad: {
        [key: string]: FedacoBuilderCallBack;
    };
    protected _localMacros: any[];
    protected _onDelete: (builder: FedacoBuilder) => any;
    protected _scopes: any;
    protected _removedScopes: any[];
    constructor(_query: QueryBuilder);
    /**
     * Add a basic where clause to the query.
     */
    where(column: FedacoBuilderCallBack | any[] | SqlNode | any): this;
    where(column: string | SqlNode | any, value: any): this;
    where(column: FedacoBuilderCallBack | string | any[] | SqlNode | any, operator?: any, value?: any, conjunction?: string): this;
    find(id: any, columns: any[]): Promise<T>;
    find(id: any[], columns: any[]): Promise<T[]>;
    findOrFail(id: any, columns: any[]): Promise<T>;
    findOrFail(id: any[], columns: any[]): Promise<T[]>;
    _enforceOrderBy(): void;
    _addTimestampsToUpsertValues(values: any[]): any[];
    _addUpdatedAtToUpsertColumns(update: string[]): string[];
    _createNestedWhere(whereSlice: any[], conjunction?: string): {
        type: string;
        query: QueryBuilder;
        boolean: string;
    };
    with(...relations: Array<{
        [key: string]: FedacoBuilderCallBack;
    } | string>): this;
    with(relations: {
        [key: string]: FedacoBuilderCallBack;
    }): this;
    with(relations: string[]): this;
    with(relations: string, callback?: FedacoBuilderCallBack): this;
    clone(): FedacoBuilder<T>;
}
export {};
