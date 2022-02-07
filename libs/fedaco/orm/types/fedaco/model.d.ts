/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { ConnectionResolverInterface } from '../interface/connection-resolver-interface';
import { QueryBuilder } from '../query-builder/query-builder';
import { BaseModel } from './base-model';
import { FedacoBuilder } from './fedaco-builder';
import { GuardsAttributes } from './mixins/guards-attributes';
import { HasAttributes } from './mixins/has-attributes';
import { HasEvents } from './mixins/has-events';
import { HasGlobalScopes } from './mixins/has-global-scopes';
import { HasRelationships } from './mixins/has-relationships';
import { HasTimestamps } from './mixins/has-timestamps';
import { HidesAttributes } from './mixins/hides-attributes';
import { Scope } from './scope';
export declare function on(clazz: typeof Model, connection?: string | null): FedacoBuilder<Model>;
export declare function onWriteConnection(clazz: typeof Model): FedacoBuilder<Model>;
export declare function all(clazz: typeof Model, columns?: any[]): Promise<Model[]>;
export declare function withRelations(clazz: typeof Model, ...relations: string[]): FedacoBuilder<Model>;
export interface Model extends HasAttributes, HasEvents, HasGlobalScopes, HasRelationships, HasTimestamps, HidesAttributes, GuardsAttributes {
}
export declare namespace Model {
    const _unguarded = false;
    const _guardableColumns: any[];
    /**
     * Disable all mass assignable restrictions.
     * @link {GuardsAttributes.reguard}
     */
    function unguard(state?: boolean): void;
    /**
     * Enable the mass assignment restrictions.
     * @link {GuardsAttributes.reguard}
     */
    function reguard(): void;
    /**
     * Determine if the current state is "unguarded".
     * @link {GuardsAttributes.isUnguarded}
     */
    function isUnguarded(): boolean;
    /**
     * Run the given callable while being unguarded.
     * @link {GuardsAttributes.unguarded}
     */
    function unguarded<R extends Promise<any> | any>(callback: () => R): R;
    const snakeAttributes: boolean;
    function addGlobalScope(scope: string, implementation: Scope | Function): void;
}
declare const Model_base: (new (...args: any[]) => HasAttributes) & {
    new (...args: any[]): {
        [x: string]: any;
        _dispatchesEvents: any;
        _observables: any[];
        getObservableEvents(): any[];
        setObservableEvents(observables: any[]): any;
        addObservableEvents(observables: any): void;
        removeObservableEvents(observables: any): void;
        _registerObserver(clazz: any & (new (...args: any[]) => HasGlobalScopes) & (new (...args: any[]) => HasRelationships) & import("./mixins/has-timestamps").HasTimestampsCtor & (new (...args: any[]) => HidesAttributes) & import("./mixins/guards-attributes").GuardsAttributesCtor<unknown> & typeof BaseModel): void;
        _fireModelEvent(event: string, halt?: boolean): any;
        _fireCustomModelEvent(event: string, method: string): any;
        _filterModelEventResults(result: any): any;
        _resolveObserverClassName(clazz: string | object): Function;
    };
    dispatcher: import("./mixins/has-events").Dispatcher;
    observe(classes: string | object | any[]): void;
    retrieved(callback: string | Function): void;
    saving(callback: string | Function): void;
    saved(callback: string | Function): void;
    updating(callback: string | Function): void;
    updated(callback: string | Function): void;
    creating(callback: string | Function): void;
    created(callback: string | Function): void;
    replicating(callback: string | Function): void;
    deleting(callback: string | Function): void;
    deleted(callback: string | Function): void;
    flushEventListeners(): void;
    getEventDispatcher(): import("./mixins/has-events").Dispatcher;
    setEventDispatcher(dispatcher: import("./mixins/has-events").Dispatcher): void;
    unsetEventDispatcher(): void;
    withoutEvents(callback: Function): any;
    _registerModelEvent(event: string, callback: string | Function): void;
} & (new (...args: any[]) => HasGlobalScopes) & (new (...args: any[]) => HasRelationships) & import("./mixins/has-timestamps").HasTimestampsCtor & (new (...args: any[]) => HidesAttributes) & import("./mixins/guards-attributes").GuardsAttributesCtor<unknown> & typeof BaseModel;
export declare class Model extends Model_base {
    _exists: boolean;
    _wasRecentlyCreated: boolean;
    _connection?: string;
    _table: string;
    _tableAlias: string;
    _primaryKey: string;
    _keyType: any;
    _incrementing: boolean;
    _with: any[];
    _withCount: any[];
    _preventsLazyLoading: boolean;
    _classCastCache: any[];
    _perPage: number;
    static resolver: ConnectionResolverInterface;
    static globalScopes: any;
    /**
     * The list of models classes that should not be affected with touch.
     */
    static ignoreOnTouch: any[];
    static booted: any;
    constructor();
    static initAttributes(attributes?: any): Model;
    bootIfNotBooted(): void;
    boot(): void;
    fireModelEvent(event: string, arg: boolean): void;
    fill(attributes: Record<string, any>): this;
    forceFill(attributes: Record<string, any>): this;
    qualifyColumn(column: string): string;
    qualifyColumns(columns: any[]): string[];
    newInstance(attributes?: any, exists?: boolean): this;
    newFromBuilder(attributes?: any, connection?: string | null): this;
    load(relations: any[] | string): Promise<this>;
    loadMissing(relations: any[] | string): this;
    loadAggregate(relations: any[] | string, column: string, func?: string): this;
    loadCount(relations: any[] | string): this;
    loadMax(relations: any[] | string, column: string): this;
    loadMin(relations: any[] | string, column: string): this;
    loadSum(relations: any[] | string, column: string): this;
    loadAvg(relations: any[] | string, column: string): this;
    loadExists(relations: any[] | string): this;
    loadMorphAggregate(relation: string, relations: Record<string, string[]>, column: string, func?: string): this;
    loadMorphCount(relation: string, relations: Record<string, string[]>): this;
    loadMorphMax(relation: string, relations: Record<string, string[]>, column: string): this;
    loadMorphMin(relation: string, relations: Record<string, string[]>, column: string): this;
    loadMorphSum(relation: string, relations: Record<string, string[]>, column: string): this;
    loadMorphAvg(relation: string, relations: Record<string, string[]>, column: string): this;
    protected increment(column: string, amount?: number, extra?: any[]): any;
    protected decrement(column: string, amount?: number, extra?: any[]): any;
    protected incrementOrDecrement(column: string, amount: number, extra: any[], method: string): any;
    update(attributes?: any, options?: any): false | Promise<boolean>;
    updateQuietly(attributes?: any[], options?: any[]): false | Promise<boolean>;
    push(): Promise<boolean>;
    saveQuietly(options?: any): Promise<boolean>;
    save(options?: {
        touch?: boolean;
    }): Promise<boolean>;
    saveOrFail(options?: any): Promise<any>;
    protected finishSave(options: {
        touch?: boolean;
    }): Promise<void>;
    protected performUpdate(query: FedacoBuilder): Promise<boolean>;
    _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;
    _getKeyForSelectQuery(): any;
    _setKeysForSaveQuery(query: FedacoBuilder): FedacoBuilder;
    protected getKeyForSaveQuery(): any;
    protected performInsert(query: FedacoBuilder): Promise<boolean>;
    protected insertAndSetId(query: FedacoBuilder, attributes: Record<string, any>): Promise<void>;
    delete(): Promise<boolean | number>;
    forceDelete(): Promise<number | boolean>;
    protected _performDeleteOnModel(): Promise<void>;
    static createQuery<T extends typeof Model>(this: T): FedacoBuilder<InstanceType<T>>;
    newQuery<T extends Model>(this: T): FedacoBuilder<T>;
    newModelQuery(): FedacoBuilder<this>;
    newQueryWithoutRelationships(): FedacoBuilder;
    registerGlobalScopes(builder: FedacoBuilder): FedacoBuilder<Model>;
    newQueryWithoutScopes(): FedacoBuilder<this>;
    newQueryWithoutScope(scope: string): FedacoBuilder<this>;
    newQueryForRestoration(ids: any[] | number | string): FedacoBuilder<this>;
    newEloquentBuilder(query: QueryBuilder): FedacoBuilder<this>;
    protected newBaseQueryBuilder(): any;
    newCollection(models?: any[]): this[];
    hasNamedScope(scope: string): boolean;
    callNamedScope(scope: string, ...parameters: any[]): any;
    toArray(): any;
    toArray2(): any;
    jsonSerialize(): any;
    fresh(_with?: any[] | string): Promise<this>;
    refresh(): Promise<this>;
    replicate(excepts?: any[] | null): any;
    is(model: Model | null): boolean;
    isNot(model: Model | null): boolean;
    getConnection(): any;
    static connectionName: string;
    getConnectionName(): string;
    setConnection(name: string | null): this;
    static resolveConnection(connection?: string | null): import("@gradii/fedaco").ConnectionInterface;
    static getConnectionResolver(): ConnectionResolverInterface;
    static setConnectionResolver(resolver: ConnectionResolverInterface): void;
    static unsetConnectionResolver(): void;
    getTable(): string;
    setTable(table: string): this;
    getKeyName(): string;
    setKeyName(key: string): this;
    getQualifiedKeyName(): string;
    getKeyType(): any;
    setKeyType(type: string): this;
    getIncrementing(): boolean;
    setIncrementing(value: boolean): this;
    getKey(): any;
    getQueueableId(): any;
    getQueueableConnection(): string;
    getRouteKey(): any;
    getRouteKeyName(): string;
    resolveRouteBinding(value: any, field?: string | null): any;
    resolveSoftDeletableRouteBinding(value: any, field?: string | null): any;
    resolveChildRouteBinding(childType: string, value: any, field: string | null): any;
    resolveSoftDeletableChildRouteBinding(childType: string, value: any, field: string | null): any;
    protected resolveChildRouteBindingQuery(childType: string, value: any, field: string | null): any;
    /**
     * Get the default foreign key name for the model.
     */
    getForeignKey(): string;
    getPerPage(): number;
    setPerPage(perPage: number): this;
    toJSON(): any;
    clone(): Model;
    static useConnection(connection?: string): FedacoBuilder<Model>;
    static withoutTouching(callback: () => Promise<any> | any): Promise<void>;
    static withoutTouchingOn(models: any[], callback: () => Promise<any> | any): Promise<void>;
    static isIgnoringTouch(clazz?: typeof Model): boolean;
}
export {};
