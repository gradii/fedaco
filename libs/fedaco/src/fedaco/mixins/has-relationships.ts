/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import { isArray, isString } from '@gradii/check-type';
import { findLast, tap } from 'ramda';
import type { RelationColumnAnnotation } from '../../annotation/relation-column';
import type { TableAnnotation } from '../../annotation/table/table';
import { Table } from '../../annotation/table/table';
import type { Constructor } from '../../helper/constructor';
import { snakeCase } from '../../helper/str';
import type { Model } from '../model';
import type { BelongsTo } from '../relations/belongs-to';
import type { BelongsToMany } from '../relations/belongs-to-many';
import type { HasMany } from '../relations/has-many';
import type { HasManyThrough } from '../relations/has-many-through';
import type { HasOne } from '../relations/has-one';
import type { HasOneOrMany } from '../relations/has-one-or-many';
import type { HasOneThrough } from '../relations/has-one-through';
import type { MorphMany } from '../relations/morph-many';
import type { MorphOne } from '../relations/morph-one';
import type { MorphOneOrMany } from '../relations/morph-one-or-many';
import type { MorphPivot } from '../relations/morph-pivot';
import type { MorphTo } from '../relations/morph-to';
import type { MorphToMany } from '../relations/morph-to-many';
import { Relation } from '../relations/relation';

export interface HasRelationships {
  _relations: any;

  _touches: string[];

  /*Get the joining table name for a many-to-many relation.*/
  joiningTable(related: typeof Model, instance?: Model | null): string;

  /*Get this model's half of the intermediate table name for belongsToMany relationships.*/
  joiningTableSegment(): string;

  /*Determine if the model touches a given relation.*/
  touches(relation: string): boolean;

  /*Touch the owning relations of the model.*/
  touchOwners(): Promise<void>;

  /*Get the polymorphic relationship columns.*/
  _getMorphs(name: string, type: string, id: string): string[];

  /*Get the class name for polymorphic relations.*/
  getMorphClass(): string;

  /*Create a new model instance for a related model.*/
  _newRelatedInstance(this: Model & this, clazz: typeof Model): Model;

  newRelation<T extends BelongsTo & BelongsToMany & HasMany & HasManyThrough &
    HasOne & HasOneOrMany & HasOneThrough & MorphMany & MorphOne & MorphOneOrMany & MorphPivot &
    MorphTo & MorphToMany, K extends keyof this>(relation: K): T;

  /*Get all the loaded relations for the instance.*/
  getRelations(): Record<string, any>;

  /*Get a specified relationship.*/
  getRelation(relation: string): any;

  /*Determine if the given relation is loaded.*/
  relationLoaded(key: string): boolean;

  /*Set the given relationship on the model.*/
  setRelation(relation: string, value: any): this;

  /*Unset a loaded relationship.*/
  unsetRelation(relation: string): this;

  /*Set the entire relations array on the model.*/
  setRelations(relations: any[]): this;

  /*Duplicate the instance and unset all the loaded relations.*/
  withoutRelations(): this;

  /*Unset all the loaded relations for the instance.*/
  unsetRelations(): this;

  /*Get the relationships that are touched on save.*/
  getTouchedRelations(): any[];

  /*Set the relationships that are touched on save.*/
  setTouchedRelations(touches: any[]): this;
}

type HasRelationshipsCtor = Constructor<HasRelationships>;

/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinHasRelationships<T extends Constructor<{}>>(base: T): HasRelationshipsCtor & T {
  // @ts-ignore
  return class _Self extends base {

    /*The loaded relationships for the model.*/
    /*protected */
    _relations: any = {};
    /*The relationships that should be touched on save.*/
    _touches: any[] = [];
    /*The many to many relationship methods.*/
    public static manyMethods: string[] = ['belongsToMany', 'morphToMany', 'morphedByMany'];
    /*The relation resolver callbacks.*/
    static _relationResolvers: any[] = [];

    /*Get the joining table name for a many-to-many relation.*/
    public joiningTable(this: Model & _Self, related: typeof Model, instance: Model | null = null): string {
      const segments = [
        instance ? instance.joiningTableSegment() : snakeCase(related.name),
        this.joiningTableSegment()
      ];
      segments.sort();
      return segments.join('_').toLowerCase();
    }

    /*Get this model's half of the intermediate table name for belongsToMany relationships.*/
    public joiningTableSegment(this: Model & _Self): string {
      return snakeCase(this.getTable());
    }

    /*Determine if the model touches a given relation.*/
    public touches(relation: string): boolean {
      return this.getTouchedRelations().includes(relation);
    }

    /*Touch the owning relations of the model.*/
    public async touchOwners(this: Model & _Self): Promise<void> {
      for (const relation of this.getTouchedRelations()) {
        await this.newRelation(relation).touch();
        await this[relation];
        if (this[relation] instanceof _Self) {
          this[relation].fireModelEvent('saved', false);
          await this[relation].touchOwners();
        } else if (isArray(this[relation])) {
          for (const it of this[relation]) {
            await it.touchOwners();
          }
        }
      }
    }

    /*Get the polymorphic relationship columns.*/
    _getMorphs(name: string, type: string, id: string): string[] {
      return [type || name + '_type', id || name + '_id'];
    }

    /*
    * @todo fixme maybe remove this.constructor.name
    * Get the class name for polymorphic relations.
    */
    public getMorphClass(): string {

      const metas                 = reflector.annotations(this.constructor);
      const meta: TableAnnotation = findLast(it => Table.isTypeOf(it), metas);

      if (meta && isString(meta.morphTypeName)) {
        return meta.morphTypeName;
      } else {
        const morphMap: Record<string, any> = Relation.morphMap();
        for (const [key, value] of Object.entries(morphMap)) {
          if (this.constructor === value) {
            return key;
          }
        }
      }
      return this.constructor.name;
    }

    /*Create a new model instance for a related model.*/
    _newRelatedInstance(this: _Self & Model & this, clazz: typeof Model): Model {
      return tap(instance => {
        if (!instance.getConnectionName()) {
          instance.setConnection(this._connection);
        }
      }, new clazz());
    }

    newRelation(this: Model & _Self, relation: string): Relation {
      const metadata = this.isRelation(relation);
      if (metadata) {
        return (metadata as RelationColumnAnnotation)._getRelation(this, relation);
      }
      return undefined;
    }

    /*Get all the loaded relations for the instance.*/
    public getRelations(): Record<string, any> {
      return this._relations;
    }

    /*Get a specified relationship.*/
    public getRelation(relation: string): any {
      return this._relations[relation];
    }

    /*Determine if the given relation is loaded.*/
    public relationLoaded(key: string): boolean {
      return key in this._relations;
    }

    /*Set the given relationship on the model.*/
    public setRelation(relation: string, value: any): this {
      this._relations[relation] = value;
      return this;
    }

    /*Unset a loaded relationship.*/
    public unsetRelation(relation: string): this {
      delete this._relations[relation];
      return this;
    }

    /*Set the entire relations array on the model.*/
    public setRelations(relations: any[]): this {
      this._relations = relations;
      return this;
    }

    /*Duplicate the instance and unset all the loaded relations.*/
    public withoutRelations(this: _Self & Model & this) {
      const model = this.clone();
      return model.unsetRelations();
    }

    /*Unset all the loaded relations for the instance.*/
    public unsetRelations(): this {
      this._relations = [];
      return this;
    }

    /*Get the relationships that are touched on save.*/
    public getTouchedRelations(): any[] {
      return this._touches;
    }

    /*Set the relationships that are touched on save.*/
    public setTouchedRelations(touches: any[]): this {
      this._touches = touches;
      return this;
    }
  };
}
