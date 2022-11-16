/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import { isAnyEmpty, isArray, isBlank, isObjectEmpty, isString } from '@gradii/nanofn';
import { difference, findLast, tap, uniq } from 'ramda';
import type { TableAnnotation } from '../annotation/table/table';
import { Table } from '../annotation/table/table';
import type { Connection } from '../connection';
import { except } from '../helper/obj';
import { plural, pluralStudy } from '@gradii/nanofn';
import { camelCase, snakeCase, upperFirst } from '@gradii/nanofn';
import type { ConnectionResolverInterface } from '../interface/connection-resolver-interface';
import type { QueryBuilder } from '../query-builder/query-builder';
import { BaseModel } from './base-model';
import { FedacoBuilder } from './fedaco-builder';
import type { GuardsAttributes } from './mixins/guards-attributes';
import { mixinGuardsAttributes } from './mixins/guards-attributes';
import type { HasAttributes } from './mixins/has-attributes';
import { mixinHasAttributes } from './mixins/has-attributes';
import type { HasEvents } from './mixins/has-events';
import { mixinHasEvents } from './mixins/has-events';
import type { HasGlobalScopes } from './mixins/has-global-scopes';
import { mixinHasGlobalScopes } from './mixins/has-global-scopes';
import type { HasRelationships } from './mixins/has-relationships';
import { mixinHasRelationships } from './mixins/has-relationships';
import type { HasTimestamps } from './mixins/has-timestamps';
import { mixinHasTimestamps } from './mixins/has-timestamps';
import type { HidesAttributes } from './mixins/hides-attributes';
import { mixinHidesAttributes } from './mixins/hides-attributes';
import { loadAggregate } from './model-helper';
// import { BelongsToMany } from './relations/belongs-to-many';
// import { HasManyThrough } from './relations/has-many-through';
import type { Scope } from './scope';


/*Begin querying the model on a given connection.*/
export function on(clazz: typeof Model, connection: string | null = null) {
  const instance = new clazz();
  instance.$setConnection(connection);
  return instance.$newQuery();
}

/*Begin querying the model on the write connection.*/
export function onWriteConnection(clazz: typeof Model) {
  return (new clazz()).$newQuery().useWriteConnection();
}

/*Get all of the models from the database.*/
export function all(clazz: typeof Model, columns: any[] = ['*']) {
  return (new clazz()).$newQuery().get(columns);
}

/*Begin querying a model with eager loading.*/
export function withRelations(clazz: typeof Model, ...relations: string[]) {
  return (new clazz()).$newQuery().with(relations);
}


// @ts-ignore
// tslint:disable-next-line:no-empty-interface
// export interface Model extends FedacoBuilder {
//
// }

export interface Model extends HasAttributes, HasEvents,
  HasGlobalScopes, HasRelationships,
  HasTimestamps, HidesAttributes,
  GuardsAttributes {

}

// tslint:disable-next-line:no-namespace
export declare namespace Model {

  /*Indicates if all mass assignment is enabled.*/
  export const _unguarded = false;
  /*The actual columns that exist on the database and can be guarded.*/
  export const _guardableColumns: any[];

  /**
   * Disable all mass assignable restrictions.
   * @link {GuardsAttributes.reguard}
   */
  export function unguard(state?: boolean): void;

  /**
   * Enable the mass assignment restrictions.
   * @link {GuardsAttributes.reguard}
   */
  export function reguard(): void;

  /**
   * Determine if the current state is "unguarded".
   * @link {GuardsAttributes.isUnguarded}
   */
  export function isUnguarded(): boolean;

  /**
   * Run the given callable while being unguarded.
   * @link {GuardsAttributes.unguarded}
   */
  export function unguarded<R extends Promise<any> | any>(callback: () => R): R;

  export const snakeAttributes: boolean;

  export function addGlobalScope(scope: string,
                                 implementation: Scope | ((q: QueryBuilder) => void)): void;

  export function addGlobalScope(scope: string, implementation: Scope | Function): void;
}

// @NoSuchMethodProxy()
export class Model extends mixinHasAttributes(
  mixinHasEvents(
    mixinHasGlobalScopes(
      mixinHasRelationships(
        mixinHasTimestamps(
          mixinHidesAttributes(
            mixinGuardsAttributes(BaseModel)
          )
        )
      )
    )
  )
) {
  /*Indicates if the model exists.*/
  _exists = false;
  /*Indicates if the model was inserted during the current request lifecycle.*/
  _wasRecentlyCreated = false;
  /*The connection name for the model.*/
  _connection?: string = undefined;
  /*The table associated with the model.*/
  _table: string;
  /* todo The table used for override _table when self nested usage*/
  _virtualTable: string;
  /*The table alias for table*/
  _tableAlias: string = undefined;
  /*The primary key for the model.*/
  readonly _primaryKey: string;

  readonly _keyType: string/* = 'int'*/;

  _incrementing = true;

  _with: any[] = [];

  _withCount: any[] = [];

  _preventsLazyLoading = false;

  _classCastCache: any[];

  _perPage = 10;

  static resolver: ConnectionResolverInterface;

  static globalScopes: any;

  /**
   * The list of models classes that should not be affected with touch.
   */
  static ignoreOnTouch: any[] = [];

  static booted: any = new Map();

  /*Create a new Eloquent model instance.*/
  public constructor() {
    super();
    this.$bootIfNotBooted();
    // this.initializeTraits();
  }

  static initAttributes(attributes: any = {}): Model {
    const m = new (this)();
    m.$syncOriginal();
    m.$fill(attributes);
    return m;
  }

  $bootIfNotBooted() {
    if (!((this.constructor as typeof Model).booted.has(this.constructor))) {
      (this.constructor as typeof Model).booted.set(this.consturctor, true);
      this.$fireModelEvent('booting', false);
      this.$boot();
      this.$fireModelEvent('booted', false);
    }
  }

  /*Bootstrap the model and its traits.*/
  $boot() {
    // Model.bootTraits()
  }

  $fireModelEvent(event: string, arg: boolean) {

  }

  /*Fill the model with an array of attributes.*/
  public $fill(attributes: Record<string, any>) {
    const totallyGuarded = this.$totallyGuarded();
    for (const [key, value] of Object.entries(this._fillableFromArray(attributes))) {
      if (this.$isFillable(key)) {
        this.$setAttribute(key, value);
      } else if (totallyGuarded) {
        throw new Error(
          `MassAssignmentException(\`Add [${key}] to fillable property to allow mass assignment on [${this.constructor.name}].\`)`);
      }
    }
    return this;
  }

  /*Fill the model with an array of attributes. Force mass assignment.*/
  public $forceFill(attributes: Record<string, any>) {
    return (this.constructor as typeof Model).unguarded(() => {
      return this.$fill(attributes);
    });
  }

  /*Qualify the given column name by the model's table.*/
  public $qualifyColumn(column: string) {
    if (column.includes('.')) {
      return column;
    }
    return `${this.$getTable()}.${column}`;
  }

  /*Qualify the given columns with the model's table.*/
  public $qualifyColumns(columns: any[]) {
    return columns.map(column => {
      return this.$qualifyColumn(column);
    });
  }

  /*Create a new instance of the given model.*/
  public $newInstance(attributes: any = {}, exists = false): this {
    const model   = (<typeof Model>this.constructor).initAttributes(/*cast type array*/ attributes);
    model._exists = exists;
    model.$setConnection(this.$getConnectionName());
    model.$setTable(this.$getTable());
    // model.mergeCasts(this._casts); todo remove me
    return model as this;
  }

  /*Create a new model instance that is existing.*/
  public $newFromBuilder(attributes: any = {}, connection: string | null = null) {
    const model = this.$newInstance({}, true);
    model.$setRawAttributes(/*cast type array*/ attributes, true);
    model.$setConnection(connection || this.$getConnectionName());
    // todo fixme
    // model._fireModelEvent('retrieved', false);
    return model;
  }

  /*Eager load relations on the model.*/
  public async $load(relations: any[] | string) {
    const query = this.$newQueryWithoutRelationships().with(
      // @ts-ignore
      isString(relations) ? arguments : relations
    );
    await query.eagerLoadRelations([this]);
    return this;
  }

  // /*Eager load relationships on the polymorphic relation of a model.*/
  // public loadMorph(relation: string, relations: any[]) {
  //   if (!this[relation]) {
  //     return this;
  //   }
  //   let className = get_class(this[relation]);
  //   this[relation].load(relations[className] ?? []);
  //   return this;
  // }

  /*Eager load relations on the model if they are not already eager loaded.*/
  public $loadMissing(relations: any[] | string) {
    // relations = isString(relations) ? arguments : relations;
    // this.newCollection([this]).loadMissing(relations);
    return this;
  }

  /*Eager load relation's column aggregations on the model.*/
  public $loadAggregate(relations: any[] | string, column: string, func?: string) {
    // this.newCollection([this]).loadAggregate(relations, column, func);
    loadAggregate([this], relations, column, func);
    return this;
  }

  /*Eager load relation counts on the model.*/
  public $loadCount(relations: any[] | string) {
    // @ts-ignore
    relations = isString(relations) ? arguments : relations;
    return this.$loadAggregate(relations, '*', 'count');
  }

  /*Eager load relation max column values on the model.*/
  public $loadMax(relations: any[] | string, column: string) {
    return this.$loadAggregate(relations, column, 'max');
  }

  /*Eager load relation min column values on the model.*/
  public $loadMin(relations: any[] | string, column: string) {
    return this.$loadAggregate(relations, column, 'min');
  }

  /*Eager load relation's column summations on the model.*/
  public $loadSum(relations: any[] | string, column: string) {
    return this.$loadAggregate(relations, column, 'sum');
  }

  /*Eager load relation average column values on the model.*/
  public $loadAvg(relations: any[] | string, column: string) {
    return this.$loadAggregate(relations, column, 'avg');
  }

  /*Eager load related model existence values on the model.*/
  public $loadExists(relations: any[] | string) {
    return this.$loadAggregate(relations, '*', 'exists');
  }

  /*Eager load relationship column aggregation on the polymorphic relation of a model.*/
  public async $loadMorphAggregate(relation: string, relations: Record<string, string[] | string>,
                                  column: string,
                                  func?: string) {
    const relationValue = await this[relation];
    if (!relationValue) {
      return this;
    }
    // todo checkme
    const className = relationValue.constructor.name;
    await loadAggregate(relationValue, relations[className] ?? [], column, func);
    return this;
  }

  /*Eager load relationship counts on the polymorphic relation of a model.*/
  public $loadMorphCount(relation: string, relations: Record<string, string[] | string>) {
    return this.$loadMorphAggregate(relation, relations, '*', 'count');
  }

  /*Eager load relationship max column values on the polymorphic relation of a model.*/
  public $loadMorphMax(relation: string, relations: Record<string, string[] | string>,
                      column: string) {
    return this.$loadMorphAggregate(relation, relations, column, 'max');
  }

  /*Eager load relationship min column values on the polymorphic relation of a model.*/
  public $loadMorphMin(relation: string, relations: Record<string, string[] | string>,
                      column: string) {
    return this.$loadMorphAggregate(relation, relations, column, 'min');
  }

  /*Eager load relationship column summations on the polymorphic relation of a model.*/
  public $loadMorphSum(relation: string, relations: Record<string, string[] | string>,
                      column: string) {
    return this.$loadMorphAggregate(relation, relations, column, 'sum');
  }

  /*Eager load relationship average column values on the polymorphic relation of a model.*/
  public $loadMorphAvg(relation: string, relations: Record<string, string[] | string>,
                      column: string) {
    return this.$loadMorphAggregate(relation, relations, column, 'avg');
  }

  /*Increment a column's value by a given amount.*/
  protected $increment(column: string, amount: number = 1, extra: any[] = []) {
    return this.$incrementOrDecrement(column, amount, extra, 'increment');
  }

  /*Decrement a column's value by a given amount.*/
  protected $decrement(column: string, amount: number = 1, extra: any[] = []) {
    return this.$incrementOrDecrement(column, amount, extra, 'decrement');
  }

  /*Run the increment or decrement method on the model.*/
  protected $incrementOrDecrement(column: string, amount: number, extra: any[],
                                 method: string) {
    const query = this.$newQueryWithoutRelationships();
    if (!this._exists) {
      // @ts-ignore
      return query[method](column, amount, extra);
    }
    if (this.isClassDeviable(column)) {
      this[column] = this.deviateClassCastableAttribute(method, column,
        amount);
    } else {
      this[column] = this[column] + (method === 'increment' ? amount : amount * -1);
    }
    this.$forceFill(extra);
    if (this._fireModelEvent('updating') === false) {
      return false;
    }
    // @ts-ignore
    return tap(this._setKeysForSaveQuery(query)[method](column, amount, extra), () => {
      this.$syncChanges();
      this._fireModelEvent('updated', false);
      this.$syncOriginalAttribute(column);
    });
  }

  /*Update the model in the database.*/
  public $update(attributes: any = {}, options: any = {}) {
    if (!this._exists) {
      return false;
    }
    return this.$fill(attributes).$save(options);
  }

  /*Update the model in the database without raising any events.*/
  public $updateQuietly(attributes: any[] = [], options: any[] = []) {
    if (!this._exists) {
      return false;
    }
    return this.$fill(attributes).$saveQuietly(options);
  }

  /*Save the model and all of its relationships.*/
  public async $push() {
    if (!await this.$save()) {
      return false;
    }
    for (let models of Object.values(this._relations)) {
      models = isArray(models) ? models : [models];
      for (const model of models) {
        if (!isBlank(model)) {
          if (!await model.$push()) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /*Save the model to the database without raising any events.*/
  public $saveQuietly(options: any = {}) {
    // return Model.withoutEvents(() => {
    return this.$save(options);
    // });
  }

  /*Save the model to the database.*/
  public async $save(options: { touch?: boolean } = {}): Promise<boolean> {
    this.$mergeAttributesFromClassCasts();
    const query = this.$newModelQuery();
    if (this._fireModelEvent('saving') === false) {
      return false;
    }
    let saved;
    if (this._exists) {
      saved = this.$isDirty() ? await this.$performUpdate(query) : true;
    } else {
      saved            = await this.$performInsert(query);
      const connection = query.getConnection();
      if (!this.$getConnectionName() && connection) {
        this.$setConnection(connection.getName());
      }
    }
    if (saved) {
      await this.$finishSave(options);
    }
    return saved;
  }

  /*Save the model to the database using transaction.*/
  public async $saveOrFail(options: any = {}) {
    return this.$getConnection().transaction(async () => {
      return this.$save(options);
    });
  }

  /*Perform any actions that are necessary after the model is saved.*/
  protected async $finishSave(options: { touch?: boolean }) {
    this._fireModelEvent('saved', false);
    if (this.$isDirty() && (options['touch'] ?? true)) {
      await this.$touchOwners();
    }
    this.$syncOriginal();
  }

  /*Perform a model update operation.*/
  protected async $performUpdate(query: FedacoBuilder) {
    if (this._fireModelEvent('updating') === false) {
      return false;
    }
    if (this.$usesTimestamps()) {
      this.$updateTimestamps();
    }
    const dirty = this.$getDirty();
    if (!isObjectEmpty(dirty)) {
      await this._setKeysForSaveQuery(query).update(dirty);
      this.$syncChanges();
      this._fireModelEvent('updated', false);
    }
    return true;
  }

  /*Set the keys for a select query.*/
  _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this> {
    query.where(this.$getKeyName(), '=', this._getKeyForSelectQuery());
    return query;
  }

  /*Get the primary key value for a select query.*/
  _getKeyForSelectQuery() {
    return this._original[this.$getKeyName()] ?? this.$getKey();
  }

  /*Set the keys for a save update query.*/
  _setKeysForSaveQuery(query: FedacoBuilder): FedacoBuilder {
    query.where(this.$getKeyName(), '=', this.$getKeyForSaveQuery());
    return query;
  }

  /*Get the primary key value for a save query.*/
  protected $getKeyForSaveQuery() {
    return this._original[this.$getKeyName()] ?? this.$getKey();
  }

  /*Perform a model insert operation.*/
  protected async $performInsert(query: FedacoBuilder) {
    if (this._fireModelEvent('creating') === false) {
      return false;
    }
    if (this.$usesTimestamps()) {
      this.$updateTimestamps();
    }
    const attributes = this.$getAttributesForInsert();
    if (this.$getIncrementing()) {
      await this.$insertAndSetId(query, attributes);
    } else {
      if (isAnyEmpty(attributes)) {
        return true;
      }
      await query.insert(attributes);
    }
    this._exists            = true;
    this.wasRecentlyCreated = true;
    this._fireModelEvent('created', false);
    return true;
  }

  /*Insert the given attributes and set the ID on the model.*/
  protected async $insertAndSetId(query: FedacoBuilder, attributes: Record<string, any>) {
    const keyName = this.$getKeyName();
    const id      = await query.insertGetId(attributes, keyName);
    this.$setAttribute(keyName, id);
  }

  // /*Destroy the models for the given IDs.*/
  // public static destroy(ids: Collection | any[] | number | string) {
  //   if (ids instanceof EloquentCollection) {
  //     ids = ids.modelKeys();
  //   }
  //   if (ids instanceof BaseCollection) {
  //     ids = ids.all();
  //   }
  //   ids = isArray(ids) ? ids : arguments;
  //   if (ids.length === 0) {
  //     return 0;
  //   }
  //   let key   = (instance = new Model()).getKeyName();
  //   let count = 0;
  //   for (let model of instance.whereIn(key, ids).get()) {
  //     if (model.delete()) {
  //       count++;
  //     }
  //   }
  //   return count;
  // }

  /*Delete the model from the database.*/
  public async $delete(): Promise<boolean | number> {
    this.$mergeAttributesFromClassCasts();
    if (isBlank(this.$getKeyName())) {
      throw new Error('LogicException No primary key defined on model.');
    }
    if (!this._exists) {
      return null;
    }
    if (this._fireModelEvent('deleting') === false) {
      return false;
    }
    await this.$touchOwners();
    await this._performDeleteOnModel();
    this._fireModelEvent('deleted', false);
    return true;
  }

  /*Force a hard delete on a soft deleted model.

  This method protects developers from running forceDelete when the trait is missing.*/
  public async $forceDelete() {
    return this.$delete();
  }

  /*Perform the actual delete query on this model instance.*/
  protected async _performDeleteOnModel() {
    await this._setKeysForSaveQuery(this.$newModelQuery()).delete();
    this._exists = false;
  }

  /*Begin querying the model.*/
  public static createQuery<T extends typeof Model>(this: T): FedacoBuilder<InstanceType<T>> {
    return (new this() as InstanceType<T>).$newQuery<InstanceType<T>>();
  }

  /*Get a new query builder for the model's table.*/
  public $newQuery<T extends Model>(this: T): FedacoBuilder<T> {
    // @ts-ignore
    return this.$registerGlobalScopes(this.$newQueryWithoutScopes());
  }

  /*Get a new query builder that doesn't have any global scopes or eager loading.*/
  public $newModelQuery(): FedacoBuilder<this> {
    return this.$newEloquentBuilder(this.$newBaseQueryBuilder()).setModel(this);
  }

  /*Get a new query builder with no relationships loaded.*/
  public $newQueryWithoutRelationships(): FedacoBuilder {
    return this.$registerGlobalScopes(this.$newModelQuery());
  }

  /*Register the global scopes for this builder instance.*/
  public $registerGlobalScopes(builder: FedacoBuilder) {
    for (const [identifier, scope] of Object.entries(this.$getGlobalScopes())) {
      builder.withGlobalScope(identifier, scope);
    }
    return builder;
  }

  /*Get a new query builder that doesn't have any global scopes.*/
  public $newQueryWithoutScopes(): FedacoBuilder<this> {
    return this.$newModelQuery().with(this._with).withCount(this._withCount);
  }

  /*Get a new query instance without a given scope.*/
  public $newQueryWithoutScope(scope: string) {
    return this.$newQuery().withoutGlobalScope(scope);
  }

  /*Get a new query to restore one or more models by their queueable IDs.*/
  public $newQueryForRestoration(ids: any[] | number | string): FedacoBuilder<this> {
    return isArray(ids) ?
      this.$newQueryWithoutScopes().whereIn(this.$getQualifiedKeyName(), ids) :
      this.$newQueryWithoutScopes().whereKey(ids);
  }

  /*Create a new Eloquent query builder for the model.*/
  public $newEloquentBuilder(query: QueryBuilder) {
    return new FedacoBuilder<this>(query);
  }

  /*Get a new query builder instance for the connection.*/
  protected $newBaseQueryBuilder() {
    return this.$getConnection().query();
  }

  /*Create a new Eloquent Collection instance.*/
  public $newCollection(models: any[] = []): this[] {
    return models;
  }

  /*Determine if the model has a given scope.*/
  public $hasNamedScope(scope: string) {
    return `scope${upperFirst(scope)}` in this;
  }

  /*Apply the given named scope if possible.*/
  public $callNamedScope(scope: string, ...parameters: any[]) {
    return (this['scope' + upperFirst(scope)]).apply(this, parameters);
  }

  /*Convert the model instance to an array.*/
  public $toArray() {
    return {...this.$attributesToArray(), ...this.$relationsToArray()};
  }

  public $toArray2() {
    return {...this.$attributesToArray2(), ...this.$relationsToArray2()};
  }

  /*Convert the model instance to JSON.*/
  // public toJson(options: number = 0) {
  //   let json = json_encode(this.jsonSerialize(), options);
  //   if (JSON_ERROR_NONE !== json_last_error()) {
  //     throw JsonEncodingException.forModel(this, json_last_error_msg());
  //   }
  //   return json;
  // }

  /*Convert the object into something JSON serializable.*/
  public $jsonSerialize() {
    return this.$toArray();
  }

  /*Reload a fresh model instance from the database.*/
  public $fresh(_with: any[] | string = []) {
    if (!this._exists) {
      return void 0;
    }
    return this._setKeysForSelectQuery(this.$newQueryWithoutScopes())
      .with(isString(_with) ? [...arguments] : _with).first();
  }

  /*Reload the current model instance with fresh attributes from the database.*/
  public async $refresh() {
    if (!this._exists) {
      return this;
    }
    const result: Model = await this._setKeysForSelectQuery(
      this.$newQueryWithoutScopes()).firstOrFail();
    this.$setRawAttributes(result._attributes);
    // this.load(this._relations.reject(relation => {
    //   return relation instanceof Pivot || is_object(relation) && in_array(AsPivot,
    //     class_uses_recursive(relation), true);
    // }).keys().all());
    this.$syncOriginal();
    return this;
  }

  /*Clone the model into a new, non-existing instance.*/
  public $replicate(excepts: any[] | null = null) {
    const defaults   = [this.$getKeyName(), this.$getCreatedAtColumn(), this.$getUpdatedAtColumn()];
    const attributes = except(this.$getAttributes(),
      excepts ? uniq([...excepts, ...defaults]) : defaults);
    return tap((instance: Model) => {
      instance.$setRawAttributes(attributes);
      instance.$setRelations(this._relations);
      instance.$fireModelEvent('replicating', false);
    }, new (this.constructor as typeof Model)());
  }

  /*Determine if two models have the same ID and belong to the same table.*/
  public $is(model: Model | null) {
    return !isBlank(model) &&
      this.$getKey() === model.$getKey() &&
      this.$getTable() === model.$getTable() &&
      this.$getConnectionName() === model.$getConnectionName();
  }

  /*Determine if two models are not the same.*/
  public $isNot(model: Model | null) {
    return !this.$is(model);
  }

  /*Get the database connection for the model.*/
  public $getConnection(): Connection {
    return (this.constructor as any).resolveConnection(
      this.$getConnectionName()
    );
  }

  static connectionName: string;

  /*Get the current connection name for the model.*/
  public $getConnectionName() {
    if (isBlank(this._connection)) {
      const metas                 = reflector.annotations(this.constructor);
      const meta: TableAnnotation = findLast((it) => {
        return Table.isTypeOf(it);
      }, metas);
      if (meta) {
        this._connection = meta.connection;
      } else if ((this.constructor as typeof Model).connectionName) {
        this._connection = (this.constructor as typeof Model).connectionName;
      } else {
        this._connection = 'default';
      }
    }
    return this._connection;
  }

  /*Set the connection associated with the model.*/
  public $setConnection(name: string | null) {
    this._connection = name;
    return this;
  }

  /*Resolve a connection instance.*/
  public static resolveConnection(connection: string | null = null) {
    return this.resolver.connection(connection);
  }

  /*Get the connection resolver instance.*/
  public static getConnectionResolver() {
    return this.resolver;
  }

  /*Set the connection resolver instance.*/
  public static setConnectionResolver(resolver: ConnectionResolverInterface) {
    this.resolver = resolver;
  }

  /*Unset the connection resolver for models.*/
  public static unsetConnectionResolver() {
    this.resolver = null;
  }

  /*Get the table associated with the model.*/
  public $getTable(): string {
    if (isBlank(this._table)) {
      // const metas                 = reflector.annotations(this.constructor);
      // const meta: TableAnnotation = findLast((it) => {
      //   return Table.isTypeOf(it);
      // }, metas);
      // if (meta) {
      //   if (!meta.noPluralTable) {
      //     this.$setTable(pluralStudy(meta.tableName));
      //   } else {
      //     this.$setTable(snakeCase(meta.tableName));
      //   }
      // } else {
        throw new Error('must define table in annotation or `_table` property');
      // }
    }
    return this._table;
  }

  /*Set the table alias.*/
  public $setTable(table: string): this {
    this._table = table;
    return this;
  }

  /*Set the table alias.*/
  public $setTableAlias(tableAlias: string) {
    this._tableAlias = tableAlias;
    return this;
  }

  /*Get the primary key for the model.*/
  public $getKeyName() {
    if (this._primaryKey === undefined) {
      return 'id';
      // throw new Error('must define primary column by @PrimaryColumn');
      // const typeOfClazz = this.constructor as typeof Model;
      // const metas       = reflector.propMetadata(typeOfClazz);
      // for (const [key, meta] of Object.entries(metas)) {
      //   const columnMeta: PrimaryColumnAnnotation = findLast(it => {
      //     return PrimaryColumn.isTypeOf(it);
      //   }, meta);
      //   if (columnMeta) {
      //     this._primaryKey = columnMeta.field || key;
      //     // this._keyType    = columnMeta.keyType;
      //     break;
      //   }
      // }
      // this._primaryKey = null;
    }
    return this._primaryKey;
  }

  // /*Set the primary key for the model.*/
  // public $setKeyName(key: string) {
  //   this._primaryKey = key;
  //   return this;
  // }

  /*Get the table qualified key name.*/
  public $getQualifiedKeyName() {
    return this.$qualifyColumn(this.$getKeyName());
  }

  /*Get the auto-incrementing key type.*/
  public $getKeyType() {
    return this._keyType;
  }

  /*Set the data type for the primary key.*/
  // public setKeyType(type: string) {
  //   this._keyType = type;
  //   return this;
  // }

  /*Get the value indicating whether the IDs are incrementing.*/
  public $getIncrementing() {
    return this._incrementing;
  }

  /*Set whether IDs are incrementing.*/
  public $setIncrementing(value: boolean) {
    this._incrementing = value;
    return this;
  }

  /*Get the value of the model's primary key.*/
  public $getKey() {
    return this.$getAttribute(this.$getKeyName());
  }

  /*Get the queueable identity for the entity.*/
  public $getQueueableId() {
    return this.$getKey();
  }

  /*Get the queueable relationships for the entity.*/
  // public getQueueableRelations() {
  //   let relations = [];
  //   for (let [key, relation] of Object.entries(this.getRelations())) {
  //     if (!method_exists(this, key)) {
  //       continue;
  //     }
  //     relations.push(key);
  //     if (relation instanceof QueueableCollection) {
  //       for (let collectionValue of relation.getQueueableRelations()) {
  //         relations.push(key + '.' + collectionValue);
  //       }
  //     }
  //     if (relation instanceof QueueableEntity) {
  //       for (let [entityKey, entityValue] of Object.entries(relation.getQueueableRelations())) {
  //         relations.push(key + '.' + entityValue);
  //       }
  //     }
  //   }
  //   return uniq(relations);
  // }

  /*Get the queueable connection for the entity.*/
  public $getQueueableConnection() {
    return this.$getConnectionName();
  }

  /*Get the value of the model's route key.*/
  public $getRouteKey() {
    return this.$getAttribute(this.$getRouteKeyName());
  }

  /*Get the route key for the model.*/
  public $getRouteKeyName() {
    return this.$getKeyName();
  }

  /*Retrieve the model for a bound value.*/
  public $resolveRouteBinding(value: any, field: string | null = null) {
    return this.where(field ?? this.$getRouteKeyName(), value).first();
  }

  /*Retrieve the model for a bound value.*/
  public $resolveSoftDeletableRouteBinding(value: any, field: string | null = null) {
    return this.where(field ?? this.$getRouteKeyName(), value).withTrashed().first();
  }

  /*Retrieve the child model for a bound value.*/
  public $resolveChildRouteBinding(childType: string, value: any, field: string | null) {
    return this.$resolveChildRouteBindingQuery(childType, value, field).first();
  }

  /*Retrieve the child model for a bound value.*/
  public $resolveSoftDeletableChildRouteBinding(childType: string, value: any,
                                               field: string | null) {
    return this.$resolveChildRouteBindingQuery(childType, value, field).withTrashed().first();
  }

  /*Retrieve the child model query for a bound value.*/
  protected $resolveChildRouteBindingQuery(childType: string, value: any, field: string | null) {
    // todo recovery me
    const relationship = this[plural(camelCase(childType))]();
    field              = field || relationship.getRelated().getRouteKeyName();
    // if (relationship instanceof HasManyThrough || relationship instanceof BelongsToMany) {
    //   return relationship.where(relationship.getRelated().getTable() + '.' + field, value);
    // } else {
    return relationship.where(field, value);
    // }
  }

  /**
   * Get the default foreign key name for the model.
   */
  public $getForeignKey() {
    return snakeCase(this.$getTable()) + '_' + this.$getKeyName();
  }

  /*Get the number of models to return per page.*/
  public $getPerPage() {
    return this._perPage;
  }

  /*Set the number of models to return per page.*/
  public $setPerPage(perPage: number) {
    this._perPage = perPage;
    return this;
  }

  public toJSON() {
    return this.$toArray();
  }

  public clone() {
    const cloned = new (this.constructor as typeof Model)();

    cloned.$setTable(this._table);
    cloned._guarded    = this._guarded && [...this._guarded];
    cloned._visible    = this._visible && [...this._visible];
    cloned._hidden     = this._hidden && [...this._hidden];
    cloned._attributes = {...this._attributes};
    cloned._relations  = {...this._relations};

    return cloned;
  }

  // /*Determine if lazy loading is disabled.*/
  // public static preventsLazyLoading() {
  //   return Model.modelsShouldPreventLazyLoading;
  // }

  /*Begin querying the model on a given connection.*/
  public static useConnection(connection?: string) {
    const instance = new this();
    instance.$setConnection(connection);
    return instance.$newQuery();
  }

  /*Disables relationship model touching for the current class during given callback scope.*/
  public static async withoutTouching(callback: () => Promise<any> | any) {
    await (this as typeof Model).withoutTouchingOn(
      [(this as typeof Model)],
      callback
    );
  }

  /*Disables relationship model touching for the given model classes during given callback scope.*/
  public static async withoutTouchingOn(models: any[], callback: () => Promise<any> | any) {
    (this as typeof Model).ignoreOnTouch = [
      ...(this as typeof Model).ignoreOnTouch,
      ...models
    ];
    try {
      await callback();
    } finally {
      (this as typeof Model).ignoreOnTouch = difference(
        (this as typeof Model).ignoreOnTouch,
        models
      );
    }
  }

  /*Determine if the given model is ignoring touches.*/
  public static isIgnoringTouch(clazz?: typeof Model) {
    clazz = clazz || Model;
    // if (!clazz['_timestamps']) {
    //   return true;
    // }
    // reflector define table is ignoring

    for (const ignoredClass of (this as typeof Model).ignoreOnTouch) {
      if (clazz === ignoredClass || ignoredClass.constructor instanceof clazz.constructor) {
        return true;
      }
    }
    return false;
  }
}
