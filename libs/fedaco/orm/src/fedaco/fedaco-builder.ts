import {
  isAnyEmpty,
  isArray,
  isBlank,
  isFunction,
  isString
} from '@gradii/check-type';
import { tap } from 'ramda';
import { mixinBuildQueries } from '../query-builder/mixins/build-query';
import { QueryBuilder } from '../query-builder/query-builder';
import { mixinForwardCallToQueryBuilder } from './mixins/forward-call-to-query-builder';
import { mixinGuardsAttributes } from './mixins/guards-attributes';
import { mixinQueriesRelationShips } from './mixins/queries-relationships';
import { Model } from './model';
import { Scope } from './scope';


// @NoSuchMethodProxy()
export class FedacoBuilder extends mixinGuardsAttributes(
  mixinQueriesRelationShips(
    mixinBuildQueries(
      mixinForwardCallToQueryBuilder(class {
      })
    )
  )) {

  /*All of the globally registered builder macros.*/
  protected static macros: any[] = [];
  /*The model being queried.*/
  protected _model: Model;
  /*The relationships that should be eager loaded.*/
  protected _eagerLoad: any[] = [];
  /*All of the locally registered builder macros.*/
  protected _localMacros: any[] = [];
  /*A replacement for the typical delete function.*/
  protected _onDelete: Function;
  /*The methods that should be returned from query builder.*/
  protected _passthru: any[] = [
    'insert', 'insertOrIgnore', 'insertGetId', 'insertUsing', 'getBindings',
    'toSql', 'dump', 'dd', 'exists', 'doesntExist',
    'count', 'min', 'max', 'avg', 'average', 'sum', 'getConnection', 'raw',
    'getGrammar'
  ];
  /*Applied global scopes.*/
  protected _scopes: any[] = [];
  /*Removed global scopes.*/
  protected _removedScopes: any[] = [];


  public constructor(protected _query: QueryBuilder) {
    super();
  }

  getQuery() {
    return this._query;
  }

  /**
   * Find a model by its primary key.
   */
  public find(id: any, columns: any[] = ['*']) {
    if (isArray(id)) {
      return this.findMany(id, columns);
    }
    return this.whereKey(id).first(columns);
  }

  /*Get the model instance being queried.*/
  public getModel() {
    return this._model;
  }

  /*Set a model instance for the model being queried.*/
  public setModel(model: Model) {
    this._model = model;
    this._query.from(model.getTable());
    return this;
  }

  public qualifyColumn(column: string) {
    return this._model.qualifyColumn(column);
  }

  /**
   * Execute the query as a "select" statement.
   */
  public get(columns: string[] | string = ['*']) {
    const builder = this.applyScopes();
    let models    = builder.getModels(columns);
    if (models.length > 0) {
      models = builder.eagerLoadRelations(models);
    }
    return models;
  }

  eagerLoadRelations(models) {
    throw new Error('not implemented yet');
    return models;
  }

  public applyScopes() {
    if (!this._scopes.length) {
      return this;
    }
    const builder = this.clone();
    for (const [identifier, scope] of Object.entries(this._scopes)) {
      if (!(builder._scopes[identifier] !== undefined)) {
        continue;
      }
      builder.callScope(builder => {
        if (isFunction(scope)) {
          scope(builder);
        }
        if (scope instanceof Scope) {
          scope.apply(builder, this.getModel());
        }
      });
    }
    return builder;
  }

  protected callScope(scope: Function, parameters: any[] = []) {
    const query              = this.getQuery();
    //todo fixme
    const originalWhereCount = isBlank(query._wheres) ? 0 : query._wheres.length;
    const result             = scope(this, ...parameters) ?? this;

    // no need to add with group
    // if (query._wheres.length > originalWhereCount) {
    //   this.addNewWheresWithinGroup(query, originalWhereCount);
    // }
    return result;
  }

  // no need to use use group
  // protected addNewWheresWithinGroup(query: FedacoBuilder, originalWhereCount: number) {
  //   const allWheres = query.wheres;
  //   query.wheres = [];
  //   this.groupWhereSliceForScope(query, array_slice(allWheres, 0, originalWhereCount));
  //   this.groupWhereSliceForScope(query, array_slice(allWheres, originalWhereCount));
  // }


  public getModels(columns: string[] | string = ['*']) {
    return this._query.get(columns);
  }

  /**
   * Find multiple models by their primary keys.
   */
  public findMany(ids: any[], columns: any[] = ['*']) {
    if (isAnyEmpty(ids)) {
      return [];
    }
    return this.whereKey(ids).get(columns);
  }

  /*Find a model by its primary key or throw an exception.*/
  public findOrFail(id: any, columns: any[] = ['*']) {
    const result = this.find(id, columns);

    if (isArray(id) && isArray(result)) {
      if (result.length === id.length) {
        return result;
      }
    } else if (!isBlank(result)) {
      return result;
    }
    throw new Error(
      `ModelNotFoundException No query results for model  ${this._model.constructor.name} ${JSON.stringify(id)});`);
  }

  public firstOrFail(columns: any[] = ['*']) {
    const model = this.first(columns);
    if (!isBlank(model)) {
      return model;
    }
    throw new Error(
      `ModelNotFoundException No query results for model  ${this._model.constructor.name});`);
  }

  /**
   * Add a where clause on the primary key to the query.
   */
  public whereKey(id: any) {
    if (isArray(id)) {
      this._query.whereIn(this._model.getQualifiedKeyName(), id);
      return this;
    }
    return this.where(this._model.getQualifiedKeyName(), '=', id);
  }

  /**
   * Add a basic where clause to the query.
   */
  public where(column: Function | string | any[],
               operator: any             = null,
               value: any                = null,
               conjunction: 'and' | 'or' = 'and') {
    if (isFunction(column) && isBlank(operator)) {
      const query = this._model.newQueryWithoutRelationships();
      column(query);
      this._query.addNestedWhereQuery(query.getQuery(), conjunction);
    } else {
      this._query.where.apply(this, arguments);
    }
    return this;
  }

  /*Get a single column's value from the first result of a query.*/
  public value(column: string) {
    const result = this.first([column]);
    if (result) {
      return result[column];
    }
  }

  /*Register a new global scope.*/
  public withGlobalScope(identifier: string, scope: Scope | Function) {
    // this._scopes[identifier] = scope;
    // if (method_exists(scope, 'extend')) {
    //   scope.extend(this);
    // }
    return this;
  }

  /*Remove a registered global scope.*/
  public withoutGlobalScope(scope: Scope | string) {
    // if (!isString(scope)) {
    //   var scope = get_class(scope);
    // }
    // delete this._scopes[scope];
    // this._removedScopes.push(scope);
    return this;
  }

  /*Remove all or passed registered global scopes.*/
  public withoutGlobalScopes(scopes: any[] | null = null) {
    // if (!isArray(scopes)) {
    //   scopes = array_keys(this._scopes);
    // }
    // for (let scope of scopes) {
    //   this.withoutGlobalScope(scope);
    // }
    return this;
  }

  /*Create a new instance of the model being queried.*/
  public newModelInstance(attributes: any[] = []) {
    return this._model
      .newInstance(attributes)
      .setConnection(this._query.getConnection().getName());
  }


  /*Find a model by its primary key or return fresh model instance.*/
  public findOrNew(id: any, columns: any[] = ['*']) {
    const model = this.find(id, columns);
    if (!isBlank(model)) {
      return model;
    }
    return this.newModelInstance();
  }

  /*Get the first record matching the attributes or instantiate it.*/
  public firstOrNew(attributes: any, values: any = {}): Model {
    const instance = this.where(attributes).first() as Model;
    if (!isBlank(instance)) {
      return instance;
    }
    return this.newModelInstance({ ...attributes, ...values });
  }

  /*Get the first record matching the attributes or create it.*/
  public firstOrCreate(attributes: any, values: any = {}) {
    const instance = this.where(attributes).first();
    if (!isBlank(instance)) {
      return instance;
    }
    return tap(instance => {
        instance.save();
      }, this.newModelInstance({ ...attributes, ...values })
    );
  }

  /*Create or update a record matching the attributes, and fill it with values.*/
  public updateOrCreate(attributes: any[], values: any[] = []) {
    return tap(instance => {
      instance.fill(values).save();
    }, this.firstOrNew(attributes));
  }

  public with(relations, callback?) {
    let eagerLoad;
    if (isFunction(callback)) {
      eagerLoad = this.parseWithRelations({ [relations]: callback });
    } else {
      eagerLoad = this.parseWithRelations(isString(relations) ? arguments : relations);
    }
    this._eagerLoad = [...this._eagerLoad, ...eagerLoad];
    return this;
  }


  protected parseWithRelations(relations: any) {
    let results = [];
    for (const [name, constraints] of Object.entries(relations)) {
      // if (isNumber(name)) {
      //   name = constraints;
      //
      //   [name, constraints] = Str.contains(name, ':') ? this.createSelectWithConstraint(name) : [name, () => {
      //   }];
      // }
      results       = this.addNestedWiths(name, results);
      results[name] = constraints;
    }
    return results;
  }

  protected addNestedWiths(name: string, results: any[]) {
    const progress = [];
    for (const segment of name.split('.')) {
      progress.push(segment);
      const last = progress.join('.');
      if (!(results[last] !== undefined)) {
        results[last] = () => {
        };
      }
    }
    return results;
  }

  /*Create a constraint to select the given columns for the relation.*/
  protected createSelectWithConstraint(name: string) {
    return [name.split(':')[0], query => {
      query.select(name.split(':')[1].split(','));
    }];
  }

  __noSuchMethod__(methodName, args) {

    const query = this.getQuery();
    if (query[methodName]) {
      return query[methodName](...args);
    }
    throw new Error('no method found');
  }

  clone() {
    const builder = new FedacoBuilder(this._query.clone());
    return builder;
  }
}