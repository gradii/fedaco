import { pluralStudy } from '../helper/pluralize';
import { snakeCase } from '../helper/str';
import { mixinForwardsCalls } from '../mixins/forwards-calls';
import { QueryBuilder } from '../query-builder/query-builder';
import { FedacoBuilder } from './fedaco-builder';
import { mixinHasGlobalScopes } from './mixins/has-global-scopes';
import { NoSuchMethodProxy } from './no-such-method-proxy';
import { Scope } from './scope';


// @ts-ignore
// tslint:disable-next-line:no-empty-interface
export interface Model extends FedacoBuilder {

}

@NoSuchMethodProxy()
export class Model extends mixinHasGlobalScopes(
  mixinForwardsCalls(class {
  })
) {
  /*Indicates if the model exists.*/
  _exists: boolean = false;
  /*Indicates if the model was inserted during the current request lifecycle.*/
  _wasRecentlyCreated: boolean = false;
  /*The connection name for the model.*/
  _connection?: string = undefined;
  /*The table associated with the model.*/
  protected _table: string = undefined;
  /*The table alias for table*/
  _tableAlias: string = undefined;
  /*The primary key for the model.*/
  _primaryKey: string = 'id';

  _connectionResolver = undefined;

  _with = [];

  protected _classCastCache: {};

  /*Create a new Eloquent model instance.*/
  public constructor(attributes: any[] = []) {
    super();
    // this.bootIfNotBooted();
    // this.initializeTraits();
    // this.syncOriginal();
    // this.fill(attributes);
  }

  /*Get the database connection for the model.*/
  public getConnection() {
    return this._connectionResolver.resolveConnection(
      this.constructor, this.getConnectionName()
    );
  }

  /*Get the current connection name for the model.*/
  public getConnectionName() {
    return this._connection;
  }

  /*Get the primary key for the model.*/
  public getKeyName() {
    return this._primaryKey;
  }

  getQualifiedKeyName() {
    return '';
  }

  /*Get the table associated with the model.*/
  public getTable() {
    return this._table || snakeCase(pluralStudy(this.constructor.name));
  }

  /*Merge new casts with existing casts on the model.*/
  public mergeCasts(casts: any[]) {
    // this._casts = [...this._casts, ...casts];
  }

  /*Create a new Eloquent Collection instance.*/
  public newCollection(models: any[] = []) {
    // return new Collection(models);
    return models;
  }

  /*Create a new Eloquent query builder for the model.*/
  public newEloquentBuilder(query: QueryBuilder) {
    return new FedacoBuilder(query);
  }

  /*Create a new instance of the given model.*/
  public newInstance(attributes: any[] = [], exists: boolean = false) {
    const model   = new Model(attributes);
    model._exists = exists;
    model.setConnection(this.getConnectionName());
    model.setTable(this.getTable());
    // model.mergeCasts(this._casts);
    return model;
  }

  /*Get a new query builder that doesn't have any global scopes or eager loading.*/
  public newModelQuery() {
    return this.newEloquentBuilder(this.newBaseQueryBuilder()).setModel(this);
  }

  /*Get a new query builder for the model's table.*/
  public newQuery() {
    return this.registerGlobalScopes(this.newQueryWithoutScopes());
  }

  /*Get a new query to restore one or more models by their queueable IDs.*/
  public newQueryForRestoration(ids: any[] | number) {
    // return isArray(ids) ? this.newQueryWithoutScopes().whereIn(this.getQualifiedKeyName(),
    //   ids) : this.newQueryWithoutScopes().whereKey(ids);
  }

  /*Get a new query builder with no relationships loaded.*/
  public newQueryWithoutRelationships() {
    return this.registerGlobalScopes(this.newModelQuery());
  }

  /*Get a new query instance without a given scope.*/
  public newQueryWithoutScope(scope: Scope | string) {
    return this.newQuery().withoutGlobalScope(scope);
  }

  /*Get a new query builder that doesn't have any global scopes.*/
  public newQueryWithoutScopes() {
    return this.newModelQuery()
      .with(this._with)
      .withCount(this.withCount);
  }

  /*Register the global scopes for this builder instance.*/
  public registerGlobalScopes(builder: FedacoBuilder): FedacoBuilder {
    for (const [identifier, scope] of Object.entries(this.getGlobalScopes())) {
      builder.withGlobalScope(identifier, scope as Scope);
    }
    return builder;
  }

  /*Fill the model with an array of attributes.*/
  public fill(attributes: any[]) {
    // const totallyGuarded = this.totallyGuarded();
    // for (let [key, value] of Object.entries(this.fillableFromArray(attributes))) {
    //   key = this.removeTableFromKey(key);
    //   if (this.isFillable(key)) {
    //     this.setAttribute(key, value);
    //   } else if (totallyGuarded) {
    //     throw new Error(`MassAssignmentException key`);
    //   }
    // }
    return this;
  }

  /*Save the model to the database.*/
  public save(options: any[] = []) {
    // this._mergeAttributesFromClassCasts();
    const query = this.newModelQuery();
    // if (this.fireModelEvent('saving') === false) {
    //   return false;
    // }
    let saved;
    // if (this._exists) {
    //   saved = this.isDirty() ? this.performUpdate(query) : true;
    // } else {
    //   saved = this.performInsert(query);
    //
    //   const connection = query.getConnection();
    //   if (!this.getConnectionName() && connection) {
    //     this.setConnection(connection.getName());
    //   }
    // }
    if (saved) {
      this._finishSave(options);
    }
    return saved;
  }

  // @Hooks({
  //   before: ()=>{
  //
  //   },
  //   after: ()=>{
  //
  //   }
  // })

  /*Set the connection associated with the model.*/
  public setConnection(name: string | null) {
    this._connection = name;
    return this;
  }

  /*Set the table associated with the model.*/
  public setTable(table: string) {
    this._table = table;
    return this;
  }

  protected __noSuchMethod__(method, parameters) {
    if (['increment', 'decrement'].includes(method)) {
      return this[method](...parameters);
    }
    // if (resolver = (this.constructor as unknown as typeof Model).relationResolvers[get_class(this)][method] ?? null) {
    //   return resolver(this);
    // }
    return this.forwardCallTo(this.newQuery(), method, parameters);
  }

  /*Perform a model insert operation.*/
  protected _performInsert(query: FedacoBuilder) {
    // if (this.fireModelEvent('creating') === false) {
    //   return false;
    // }
    // if (this.usesTimestamps()) {
    //   this.updateTimestamps();
    // }
    // var attributes = this.getAttributes();
    // if (this.getIncrementing()) {
    //   this._insertAndSetId(query, attributes);
    // } else {
    //   if (empty(attributes)) {
    //     return true;
    //   }
    //   query.insert(attributes);
    // }
    // this.exists = true;
    // this.wasRecentlyCreated = true;
    // this.fireModelEvent('created', false);
    return true;
  }

  /*Insert the given attributes and set the ID on the model.*/
  protected _insertAndSetId(query: FedacoBuilder, attributes: any[]) {
    // const keyName = this.getKeyName()
    // var id = query.insertGetId(attributes, keyName);
    // this.setAttribute(keyName, id);
  }

  /*Perform the actual delete query on this model instance.*/
  protected performDeleteOnModel() {
    // this.setKeysForSaveQuery(this.newModelQuery()).delete();
    this._exists = false;
  }

  /*Perform any actions that are necessary after the model is saved.*/
  protected _finishSave(options: any[]) {
    // this.fireModelEvent('saved', false);
    // if (this.isDirty() && (options['touch'] ?? true)) {
    //   this.touchOwners();
    // }
    // this.syncOriginal();
  }

  /*Get a new query builder instance for the connection.*/
  protected newBaseQueryBuilder() {
    return this.getConnection().query();
  }

  public qualifyColumn(column: string) {
    if (column.includes('.')) {
      return column;
    }
    return this.getTable() + '.' + column;
  }

  /*Merge the cast class attributes back into the model.*/
  // protected _mergeAttributesFromClassCasts() {
  //   for (let [key, value] of Object.entries(this._classCastCache)) {
  //     var caster = this.resolveCasterClass(key);
  //     this.attributes = [
  //       ...this.attributes,
  //       ...(caster instanceof CastsInboundAttributes ? {} : this.normalizeCastClassResponse(
  //         key,
  //         caster.set(this, key, value, this.attributes)
  //       )
  //     )];
  //   }
  // }

}