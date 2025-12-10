/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import {
  camelCase,
  difference,
  findLast,
  isAnyEmpty,
  isArray,
  isBlank,
  isObjectEmpty,
  isString,
  plural,
  snakeCase,
  tap,
  uniq,
  upperFirst,
} from '@gradii/nanofn';
import type { TableAnnotation } from '../annotation/table/table';
import { Table } from '../annotation/table/table';
import type { Connection } from '../connection';
import { except } from '../helper/obj';
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
import { type KeyAbleModel } from '../types/model-type';
import { withTrashed } from './scopes/soft-deleting-scope';
import { type Constructor } from '../helper/constructor';
// import { BelongsToMany } from './relations/belongs-to-many';
// import { HasManyThrough } from './relations/has-many-through';

/* Begin querying the model on a given connection. */
export function on(clazz: typeof Model, connection: string | null = null) {
  const instance = new clazz();
  instance.SetConnection(connection);
  return instance.NewQuery();
}

/* Begin querying the model on the write connection. */
export function onWriteConnection(clazz: typeof Model) {
  return new clazz().NewQuery().useWriteConnection();
}

/* Get all of the models from the database. */
export function all(clazz: typeof Model, columns: any[] = ['*']) {
  return new clazz().NewQuery().get(columns);
}

/* Begin querying a model with eager loading. */
export function withRelations(clazz: typeof Model, ...relations: string[]) {
  return new clazz().NewQuery().with(relations);
}

// @ts-ignore
// tslint:disable-next-line:no-empty-interface
// export interface Model extends FedacoBuilder {
//
// }

export interface Model
  extends
    HasAttributes,
    HasEvents,
    HasGlobalScopes,
    HasRelationships,
    HasTimestamps,
    HidesAttributes,
    GuardsAttributes {}

// @NoSuchMethodProxy()
export class Model extends mixinHasAttributes(
  mixinHasEvents(
    mixinHasGlobalScopes(
      mixinHasRelationships(mixinHasTimestamps(mixinHidesAttributes(mixinGuardsAttributes(BaseModel)))),
    ),
  ),
) {
  /* Indicates if the model exists. */
  _exists = false;
  /* Indicates if the model was inserted during the current request lifecycle. */
  _wasRecentlyCreated = false;
  /* The connection name for the model. */
  _connection?: string = undefined;
  /* The table associated with the model. */
  _table: string;
  /* todo The table used for override _table when self nested usage */
  _virtualTable: string;
  /* The table alias for table */
  _tableAlias: string = undefined;
  /* The primary key for the model. */
  readonly _primaryKey: string;

  readonly _keyType: string /* = 'int' */;

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

  /* Create a new Eloquent model instance. */
  public constructor() {
    super();
    this.BootIfNotBooted();
    // this.initializeTraits();
  }

  static initAttributes<T extends Model>(
    this: {
      new (...args: any[]): T;
    },
    attributes: Record<string, any> = {},
  ): T {
    const m = new this();
    m.SyncOriginal();
    m.Fill(attributes);
    return m;
  }

  BootIfNotBooted() {
    if (!(this.constructor as typeof Model).booted.has(this.constructor)) {
      (this.constructor as typeof Model).booted.set((this as any).consturctor, true);
      this.FireModelEvent('booting', false);
      this.Boot();
      this.FireModelEvent('booted', false);
    }
  }

  /* Bootstrap the model and its traits. */
  Boot() {
    // Model.bootTraits()
  }

  FireModelEvent(event: string, arg: boolean) {}

  /* Fill the model with an array of attributes. */
  public Fill(attributes: Record<string, any>) {
    const totallyGuarded = this.TotallyGuarded();
    for (const [key, value] of Object.entries(this._fillableFromArray(attributes))) {
      if (this.IsFillable(key)) {
        this.SetAttribute(key, value);
      } else if (totallyGuarded) {
        throw new Error(
          `MassAssignmentException(\`Add [${key}] to fillable property to allow mass assignment on [${this.constructor.name}].\`)`,
        );
      }
    }
    return this;
  }

  /* Fill the model with an array of attributes. Force mass assignment. */
  public ForceFill(attributes: Record<string, any>) {
    return (this.constructor as typeof Model).unguarded(() => {
      return this.Fill(attributes);
    });
  }

  /* Qualify the given column name by the model's table. */
  public QualifyColumn(column: string) {
    if (column.includes('.')) {
      return column;
    }
    return `${this.GetTable()}.${column}`;
  }

  /* Qualify the given columns with the model's table. */
  public QualifyColumns(columns: any[]) {
    return columns.map((column) => {
      return this.QualifyColumn(column);
    });
  }

  /* Create a new instance of the given model. */
  public NewInstance(attributes: any = {}, exists = false): this {
    const model = (<typeof Model>this.constructor).initAttributes(/* cast type array */ attributes);
    model._exists = exists;
    model.SetConnection(this.GetConnectionName());
    model.SetTable(this.GetTable());
    // model.mergeCasts(this._casts); todo remove me
    return model as this;
  }

  /* Create a new model instance that is existing. */
  public NewFromBuilder(attributes: any = {}, connection: string | null = null) {
    const model = this.NewInstance({}, true);
    model.SetRawAttributes(/* cast type array */ attributes, true);
    model.SetConnection(connection || this.GetConnectionName());
    // todo fixme
    // model._fireModelEvent('retrieved', false);
    return model;
  }

  /* Eager load relations on the model. */
  public async Load(relations: any[] | string) {
    const query = this.NewQueryWithoutRelationships().with(
      // @ts-ignore
      isString(relations) ? arguments : relations,
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

  /* Eager load relations on the model if they are not already eager loaded. */
  public LoadMissing(relations: any[] | string) {
    // relations = isString(relations) ? arguments : relations;
    // this.newCollection([this]).loadMissing(relations);
    return this;
  }

  /* Eager load relation's column aggregations on the model. */
  public LoadAggregate(relations: any[] | string, column: string, func?: string) {
    // this.newCollection([this]).loadAggregate(relations, column, func);
    loadAggregate([this], relations, column, func);
    return this;
  }

  /* Eager load relation counts on the model. */
  public LoadCount(relations: any[] | string) {
    // @ts-ignore
    relations = isString(relations) ? arguments : relations;
    return this.LoadAggregate(relations, '*', 'count');
  }

  /* Eager load relation max column values on the model. */
  public LoadMax(relations: any[] | string, column: string) {
    return this.LoadAggregate(relations, column, 'max');
  }

  /* Eager load relation min column values on the model. */
  public LoadMin(relations: any[] | string, column: string) {
    return this.LoadAggregate(relations, column, 'min');
  }

  /* Eager load relation's column summations on the model. */
  public LoadSum(relations: any[] | string, column: string) {
    return this.LoadAggregate(relations, column, 'sum');
  }

  /* Eager load relation average column values on the model. */
  public LoadAvg(relations: any[] | string, column: string) {
    return this.LoadAggregate(relations, column, 'avg');
  }

  /* Eager load related model existence values on the model. */
  public LoadExists(relations: any[] | string) {
    return this.LoadAggregate(relations, '*', 'exists');
  }

  /* Eager load relationship column aggregation on the polymorphic relation of a model. */
  public async LoadMorphAggregate(
    relation: string,
    relations: Record<string, string[] | string>,
    column: string,
    func?: string,
  ) {
    const relationValue = await (this as KeyAbleModel)[relation];
    if (!relationValue) {
      return this;
    }
    // todo checkme
    const className = relationValue.constructor.name;
    await loadAggregate(relationValue, relations[className] ?? [], column, func);
    return this;
  }

  /* Eager load relationship counts on the polymorphic relation of a model. */
  public LoadMorphCount(relation: string, relations: Record<string, string[] | string>) {
    return this.LoadMorphAggregate(relation, relations, '*', 'count');
  }

  /* Eager load relationship max column values on the polymorphic relation of a model. */
  public LoadMorphMax(relation: string, relations: Record<string, string[] | string>, column: string) {
    return this.LoadMorphAggregate(relation, relations, column, 'max');
  }

  /* Eager load relationship min column values on the polymorphic relation of a model. */
  public LoadMorphMin(relation: string, relations: Record<string, string[] | string>, column: string) {
    return this.LoadMorphAggregate(relation, relations, column, 'min');
  }

  /* Eager load relationship column summations on the polymorphic relation of a model. */
  public LoadMorphSum(relation: string, relations: Record<string, string[] | string>, column: string) {
    return this.LoadMorphAggregate(relation, relations, column, 'sum');
  }

  /* Eager load relationship average column values on the polymorphic relation of a model. */
  public LoadMorphAvg(relation: string, relations: Record<string, string[] | string>, column: string) {
    return this.LoadMorphAggregate(relation, relations, column, 'avg');
  }

  /* Increment a column's value by a given amount. */
  protected Increment(column: string, amount = 1, extra: any[] = []) {
    return this.IncrementOrDecrement(column, amount, extra, 'increment');
  }

  /* Decrement a column's value by a given amount. */
  protected Decrement(column: string, amount = 1, extra: any[] = []) {
    return this.IncrementOrDecrement(column, amount, extra, 'decrement');
  }

  /* Run the increment or decrement method on the model. */
  protected IncrementOrDecrement(column: string, amount: number, extra: any[], method: string) {
    const query = this.NewQueryWithoutRelationships();
    if (!this._exists) {
      // @ts-ignore
      return query[method](column, amount, extra);
    }
    // if (this.isClassDeviable(column)) {
    //   this[column] = this.deviateClassCastableAttribute(method, column, amount);
    // } else {
    (this as KeyAbleModel)[column] = (this as KeyAbleModel)[column] + (method === 'increment' ? amount : amount * -1);
    // }
    this.ForceFill(extra);
    if (this._fireModelEvent('updating') === false) {
      return false;
    }
    // @ts-expect-error method call
    return tap(this._setKeysForSaveQuery(query)[method](column, amount, extra), () => {
      this.SyncChanges();
      this._fireModelEvent('updated', false);
      this.SyncOriginalAttribute(column);
    });
  }

  /* Update the model in the database. */
  public Update(attributes: any = {}, options: any = {}) {
    if (!this._exists) {
      return false;
    }
    return this.Fill(attributes).Save(options);
  }

  /* Update the model in the database without raising any events. */
  public UpdateQuietly(attributes: any[] = [], options: any[] = []) {
    if (!this._exists) {
      return false;
    }
    return this.Fill(attributes).SaveQuietly(options);
  }

  /* Save the model and all of its relationships. */
  public async Push() {
    if (!(await this.Save())) {
      return false;
    }
    for (let models of Object.values(this._relations)) {
      models = isArray(models) ? models : [models];
      for (const model of models) {
        if (!isBlank(model)) {
          if (!(await model.Push())) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /* Save the model to the database without raising any events. */
  public SaveQuietly(options: any = {}) {
    // return Model.withoutEvents(() => {
    return this.Save(options);
    // });
  }

  /* Save the model to the database. */
  public async Save(options: { touch?: boolean } = {}): Promise<boolean> {
    this.MergeAttributesFromClassCasts();
    const query = this.NewModelQuery();
    if (this._fireModelEvent('saving') === false) {
      return false;
    }
    let saved;
    if (this._exists) {
      saved = this.IsDirty() ? await this.PerformUpdate(query) : true;
    } else {
      saved = await this.PerformInsert(query);
      const connection = query.getConnection();
      if (!this.GetConnectionName() && connection) {
        this.SetConnection(connection.getName());
      }
    }
    if (saved) {
      await this.FinishSave(options);
    }
    return saved;
  }

  /* Save the model to the database using transaction. */
  public async SaveOrFail(options: any = {}) {
    return this.GetConnection().transaction(async () => {
      return this.Save(options);
    });
  }

  /* Perform any actions that are necessary after the model is saved. */
  protected async FinishSave(options: { touch?: boolean }) {
    this._fireModelEvent('saved', false);
    if (this.IsDirty() && (options['touch'] ?? true)) {
      await this.TouchOwners();
    }
    this.SyncOriginal();
  }

  /* Perform a model update operation. */
  protected async PerformUpdate(query: FedacoBuilder) {
    if (this._fireModelEvent('updating') === false) {
      return false;
    }
    if (this.UsesTimestamps()) {
      this.UpdateTimestamps();
    }
    const dirty = this.GetDirty();
    if (!isObjectEmpty(dirty)) {
      await this._setKeysForSaveQuery(query).update(dirty);
      this.SyncChanges();
      this._fireModelEvent('updated', false);
    }
    return true;
  }

  /* Set the keys for a select query. */
  _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this> {
    query.where(this.GetKeyName(), '=', this._getKeyForSelectQuery());
    return query;
  }

  /* Get the primary key value for a select query. */
  _getKeyForSelectQuery() {
    return this._original[this.GetKeyName()] ?? this.GetKey();
  }

  /* Set the keys for a save update query. */
  _setKeysForSaveQuery(query: FedacoBuilder): FedacoBuilder {
    query.where(this.GetKeyName(), '=', this.GetKeyForSaveQuery());
    return query;
  }

  /* Get the primary key value for a save query. */
  protected GetKeyForSaveQuery() {
    return this._original[this.GetKeyName()] ?? this.GetKey();
  }

  /* Perform a model insert operation. */
  protected async PerformInsert(query: FedacoBuilder) {
    if (this._fireModelEvent('creating') === false) {
      return false;
    }
    if (this.UsesTimestamps()) {
      this.UpdateTimestamps();
    }
    const attributes = this.GetAttributesForInsert();
    if (this.GetIncrementing()) {
      await this.InsertAndSetId(query, attributes);
    } else {
      if (isAnyEmpty(attributes)) {
        return true;
      }
      await query.insert(attributes);
    }
    this._exists = true;
    this._wasRecentlyCreated = true;
    this._fireModelEvent('created', false);
    return true;
  }

  /* Insert the given attributes and set the ID on the model. */
  protected async InsertAndSetId(query: FedacoBuilder, attributes: Record<string, any>) {
    const keyName = this.GetKeyName();
    const id = await query.insertGetId(attributes, keyName);
    this.SetAttribute(keyName, id);
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

  /* Delete the model from the database. */
  public async Delete(): Promise<boolean | number> {
    this.MergeAttributesFromClassCasts();
    if (isBlank(this.GetKeyName())) {
      throw new Error('LogicException No primary key defined on model.');
    }
    if (!this._exists) {
      return null;
    }
    if (this._fireModelEvent('deleting') === false) {
      return false;
    }
    await this.TouchOwners();
    await this._performDeleteOnModel();
    this._fireModelEvent('deleted', false);
    return true;
  }

  /* Force a hard delete on a soft deleted model.

  This method protects developers from running forceDelete when the trait is missing. */
  public async ForceDelete() {
    return this.Delete();
  }

  /* Perform the actual delete query on this model instance. */
  protected async _performDeleteOnModel() {
    await this._setKeysForSaveQuery(this.NewModelQuery()).delete();
    this._exists = false;
  }

  /* Begin querying the model. */
  public static createQuery<T extends typeof Model>(this: T): FedacoBuilder<InstanceType<T>> {
    return (new this() as InstanceType<T>).NewQuery<InstanceType<T>>();
  }

  /* Get a new query builder for the model's table. */
  public NewQuery<T extends Model>(this: T): FedacoBuilder<T> {
    // @ts-ignore
    return this.RegisterGlobalScopes(this.NewQueryWithoutScopes());
  }

  /* Get a new query builder that doesn't have any global scopes or eager loading. */
  public NewModelQuery(): FedacoBuilder<this> {
    return this.NewEloquentBuilder(this.NewBaseQueryBuilder()).setModel(this);
  }

  /* Get a new query builder with no relationships loaded. */
  public NewQueryWithoutRelationships(): FedacoBuilder {
    return this.RegisterGlobalScopes(this.NewModelQuery());
  }

  /* Register the global scopes for this builder instance. */
  public RegisterGlobalScopes(builder: FedacoBuilder) {
    for (const [identifier, scope] of Object.entries(this.GetGlobalScopes())) {
      builder.withGlobalScope(identifier, scope);
    }
    return builder;
  }

  /* Get a new query builder that doesn't have any global scopes. */
  public NewQueryWithoutScopes(): FedacoBuilder<this> {
    return this.NewModelQuery().with(this._with).withCount(this._withCount);
  }

  /* Get a new query instance without a given scope. */
  public NewQueryWithoutScope(scope: string) {
    return this.NewQuery().withoutGlobalScope(scope);
  }

  /* Get a new query to restore one or more models by their queueable IDs. */
  public NewQueryForRestoration(ids: any[] | number | string): FedacoBuilder<this> {
    return isArray(ids)
      ? this.NewQueryWithoutScopes().whereIn(this.GetQualifiedKeyName(), ids)
      : this.NewQueryWithoutScopes().whereKey(ids);
  }

  /* Create a new Eloquent query builder for the model. */
  public NewEloquentBuilder(query: QueryBuilder) {
    return new FedacoBuilder<this>(query);
  }

  /* Get a new query builder instance for the connection. */
  protected NewBaseQueryBuilder() {
    return this.GetConnection().query();
  }

  /* Create a new Eloquent Collection instance. */
  public NewCollection(models: any[] = []): this[] {
    return models;
  }

  /* Determine if the model has a given scope. */
  public HasNamedScope(scope: string) {
    return `scope${upperFirst(scope)}` in this;
  }

  /* Apply the given named scope if possible. */
  public CallNamedScope(scope: string, ...parameters: any[]) {
    return (this as KeyAbleModel)['scope' + upperFirst(scope)].apply(this, parameters);
  }

  /* Convert the model instance to an array. */
  public ToArray() {
    return { ...this.AttributesToArray(), ...this.RelationsToArray() };
  }

  public ToArray2() {
    return { ...this.AttributesToArray2(), ...this.RelationsToArray2() };
  }

  /* Convert the model instance to JSON. */
  // public toJson(options: number = 0) {
  //   let json = json_encode(this.jsonSerialize(), options);
  //   if (JSON_ERROR_NONE !== json_last_error()) {
  //     throw JsonEncodingException.forModel(this, json_last_error_msg());
  //   }
  //   return json;
  // }

  /* Convert the object into something JSON serializable. */
  public JsonSerialize() {
    return this.ToArray();
  }

  /* Reload a fresh model instance from the database. */
  public Fresh(_with: any[] | string = []) {
    if (!this._exists) {
      return void 0;
    }
    return this._setKeysForSelectQuery(this.NewQueryWithoutScopes())
      .with(isString(_with) ? [...arguments] : _with)
      .first();
  }

  /* Reload the current model instance with fresh attributes from the database. */
  public async Refresh() {
    if (!this._exists) {
      return this;
    }
    const result: Model = await this._setKeysForSelectQuery(this.NewQueryWithoutScopes()).firstOrFail();
    this.SetRawAttributes(result._attributes);
    // this.load(this._relations.reject(relation => {
    //   return relation instanceof Pivot || is_object(relation) && in_array(AsPivot,
    //     class_uses_recursive(relation), true);
    // }).keys().all());
    this.SyncOriginal();
    return this;
  }

  /* Clone the model into a new, non-existing instance. */
  public Replicate<T extends Model>(this: T, excepts: any[] | null = null): T {
    const defaults = [this.GetKeyName(), this.GetCreatedAtColumn(), this.GetUpdatedAtColumn()];
    const attributes = except(this.GetAttributes(), excepts ? uniq([...excepts, ...defaults]) : defaults);
    return tap(new (this.constructor as typeof Model)(), (instance: Model) => {
      instance.SetRawAttributes(attributes);
      instance.SetRelations(this._relations);
      instance.FireModelEvent('replicating', false);
    }) as T;
  }

  /* Determine if two models have the same ID and belong to the same table. */
  public Is(model: Model | null) {
    return (
      !isBlank(model) &&
      this.GetKey() === model.GetKey() &&
      this.GetTable() === model.GetTable() &&
      this.GetConnectionName() === model.GetConnectionName()
    );
  }

  /* Determine if two models are not the same. */
  public IsNot(model: Model | null) {
    return !this.Is(model);
  }

  /* Get the database connection for the model. */
  public GetConnection(): Connection {
    return (this.constructor as any).resolveConnection(this.GetConnectionName());
  }

  static connectionName: string;

  /* Get the current connection name for the model. */
  public GetConnectionName() {
    if (isBlank(this._connection)) {
      const metas = reflector.annotations(this.constructor);
      const meta: TableAnnotation = findLast(metas, (it) => {
        return Table.isTypeOf(it);
      });
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

  /* Set the connection associated with the model. */
  public SetConnection(name: string | null) {
    this._connection = name;
    return this;
  }

  /* Resolve a connection instance. */
  public static resolveConnection(connection: string | null = null) {
    return this.resolver.connection(connection);
  }

  /* Get the connection resolver instance. */
  public static getConnectionResolver() {
    return this.resolver;
  }

  /* Set the connection resolver instance. */
  public static setConnectionResolver(resolver: ConnectionResolverInterface) {
    this.resolver = resolver;
  }

  /* Unset the connection resolver for models. */
  public static unsetConnectionResolver() {
    this.resolver = null;
  }

  /* Get the table associated with the model. */
  public GetTable(): string {
    if (isBlank(this._table)) {
      // const metas                 = reflector.annotations(this.constructor);
      // const meta: TableAnnotation = findLast((it) => {
      //   return Table.isTypeOf(it);
      // }, metas);
      // if (meta) {
      //   if (!meta.noPluralTable) {
      //     this.SetTable(pluralStudly(meta.tableName));
      //   } else {
      //     this.SetTable(snakeCase(meta.tableName));
      //   }
      // } else {
      throw new Error('must define table in annotation or `_table` property');
      // }
    }
    return this._table;
  }

  /* Set the table alias. */
  public SetTable(table: string): this {
    this._table = table;
    return this;
  }

  /* Set the table alias. */
  public SetTableAlias(tableAlias: string) {
    this._tableAlias = tableAlias;
    return this;
  }

  /* Get the primary key for the model. */
  public GetKeyName() {
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
  // public SetKeyName(key: string) {
  //   this._primaryKey = key;
  //   return this;
  // }

  /* Get the table qualified key name. */
  public GetQualifiedKeyName() {
    return this.QualifyColumn(this.GetKeyName());
  }

  /* Get the auto-incrementing key type. */
  public GetKeyType() {
    return this._keyType;
  }

  /* Set the data type for the primary key. */
  // public setKeyType(type: string) {
  //   this._keyType = type;
  //   return this;
  // }

  /* Get the value indicating whether the IDs are incrementing. */
  public GetIncrementing() {
    return this._incrementing;
  }

  /* Set whether IDs are incrementing. */
  public SetIncrementing(value: boolean) {
    this._incrementing = value;
    return this;
  }

  /* Get the value of the model's primary key. */
  public GetKey() {
    return this.GetAttribute(this.GetKeyName());
  }

  /* Get the queueable identity for the entity. */
  public GetQueueableId() {
    return this.GetKey();
  }

  /* Get the queueable relationships for the entity. */
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

  /* Get the queueable connection for the entity. */
  public GetQueueableConnection() {
    return this.GetConnectionName();
  }

  /* Get the value of the model's route key. */
  public GetRouteKey() {
    return this.GetAttribute(this.GetRouteKeyName());
  }

  /* Get the route key for the model. */
  public GetRouteKeyName() {
    return this.GetKeyName();
  }

  /* Retrieve the model for a bound value. */
  public ResolveRouteBinding(value: any, field: string | null = null) {
    return this.NewQuery()
      .where(field ?? this.GetRouteKeyName(), value)
      .first();
  }

  /* Retrieve the model for a bound value. */
  public ResolveSoftDeletableRouteBinding(value: any, field: string | null = null) {
    return this.NewQuery()
      .where(field ?? this.GetRouteKeyName(), value)
      .pipe(withTrashed())
      .first();
  }

  /* Retrieve the child model for a bound value. */
  public ResolveChildRouteBinding(childType: string, value: any, field: string | null) {
    return this.ResolveChildRouteBindingQuery(childType, value, field).first();
  }

  /* Retrieve the child model for a bound value. */
  public ResolveSoftDeletableChildRouteBinding(childType: string, value: any, field: string | null) {
    return this.ResolveChildRouteBindingQuery(childType, value, field).withTrashed().first();
  }

  /* Retrieve the child model query for a bound value. */
  protected ResolveChildRouteBindingQuery(childType: string, value: any, field: string | null) {
    // todo recovery me
    const relationship = (this as KeyAbleModel)[plural(camelCase(childType))]();
    field = field || relationship.getRelated().getRouteKeyName();
    // if (relationship instanceof HasManyThrough || relationship instanceof BelongsToMany) {
    //   return relationship.where(relationship.getRelated().getTable() + '.' + field, value);
    // } else {
    return relationship.where(field, value);
    // }
  }

  /**
   * Get the default foreign key name for the model.
   */
  public GetForeignKey() {
    return snakeCase(this.GetTable()) + '_' + this.GetKeyName();
  }

  /* Get the number of models to return per page. */
  public GetPerPage() {
    return this._perPage;
  }

  /* Set the number of models to return per page. */
  public SetPerPage(perPage: number) {
    this._perPage = perPage;
    return this;
  }

  public toJSON() {
    return this.ToArray();
  }

  public clone<T extends Model>(this: T): T {
    const cloned = new (this.constructor as typeof Model)() as T;

    cloned.SetTable(this._table);
    cloned._guarded = this._guarded && [...this._guarded];
    cloned._visible = this._visible && [...this._visible];
    cloned._hidden = this._hidden && [...this._hidden];
    cloned._attributes = { ...this._attributes };
    cloned._relations = { ...this._relations };

    return cloned;
  }

  // /*Determine if lazy loading is disabled.*/
  // public static preventsLazyLoading() {
  //   return Model.modelsShouldPreventLazyLoading;
  // }

  /* Begin querying the model on a given connection. */
  public static useConnection<T extends Model>(this: Constructor<T>, connection?: string): FedacoBuilder<T> {
    const instance = new this();
    instance.SetConnection(connection);
    return instance.NewQuery();
  }

  /* Disables relationship model touching for the current class during given callback scope. */
  public static async withoutTouching(callback: () => Promise<any> | any) {
    await (this as typeof Model).withoutTouchingOn([this as typeof Model], callback);
  }

  /* Disables relationship model touching for the given model classes during given callback scope. */
  public static async withoutTouchingOn(models: any[], callback: () => Promise<any> | any) {
    (this as typeof Model).ignoreOnTouch = [...(this as typeof Model).ignoreOnTouch, ...models];
    try {
      await callback();
    } finally {
      (this as typeof Model).ignoreOnTouch = difference((this as typeof Model).ignoreOnTouch, models);
    }
  }

  /* Determine if the given model is ignoring touches. */
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
