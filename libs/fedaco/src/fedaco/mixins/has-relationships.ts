/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { reflector } from '@gradii/annotation';
import { findLast, isArray, isString, snakeCase, tap } from '@gradii/nanofn';
import type { RelationColumnAnnotation } from '../../annotation/relation-column';
import type { TableAnnotation } from '../../annotation/table/table';
import { Table } from '../../annotation/table/table';
import type { Constructor } from '../../helper/constructor';
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
  _relations: Record<string, Model | Model[]>;

  _touches: string[];

  /* Get the joining table name for a many-to-many relation. */
  JoiningTable(related: typeof Model, instance?: Model | null): string;

  /* Get this model's half of the intermediate table name for belongsToMany relationships. */
  JoiningTableSegment(): string;

  /* Determine if the model touches a given relation. */
  Touches(relation: string): boolean;

  /* Touch the owning relations of the model. */
  TouchOwners(): Promise<void>;

  /* Get the polymorphic relationship columns. */
  _getMorphs(name: string, type: string, id: string): string[];

  /* Get the class name for polymorphic relations. */
  GetMorphClass(): string;

  /* Create a new model instance for a related model. */
  _newRelatedInstance(this: Model & this, clazz: typeof Model): Model;

  NewRelation<
    T extends BelongsTo &
      BelongsToMany &
      HasMany &
      HasManyThrough &
      HasOne &
      HasOneOrMany &
      HasOneThrough &
      MorphMany &
      MorphOne &
      MorphOneOrMany &
      Omit<MorphPivot, keyof Model> &
      MorphTo &
      MorphToMany,
    K extends keyof this,
  >(
    relation: K,
  ): T;

  /* Get all the loaded relations for the instance. */
  GetRelations(): Record<string, any>;

  /* Get a specified relationship. */
  GetRelation(relation: string): any;

  /* Determine if the given relation is loaded. */
  RelationLoaded(key: string): boolean;

  /* Set the given relationship on the model. */
  SetRelation(relation: string, value: any): this;

  /* Unset a loaded relationship. */
  UnsetRelation(relation: string): this;

  /* Set the entire relations array on the model. */
  SetRelations(relations: Record<string, Model | Model[]>): this;

  /* Duplicate the instance and unset all the loaded relations. */
  WithoutRelations(): this;

  /* Unset all the loaded relations for the instance. */
  UnsetRelations(): this;

  /* Get the relationships that are touched on save. */
  GetTouchedRelations(): any[];

  /* Set the relationships that are touched on save. */
  SetTouchedRelations(touches: any[]): this;
}

type HasRelationshipsCtor = Constructor<HasRelationships>;

/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinHasRelationships<T extends Constructor<{}>>(base: T): HasRelationshipsCtor & T {
  // @ts-ignore
  return class _Self extends base {
    /* The loaded relationships for the model. */
    /* protected */
    _relations: any = {};
    /* The relationships that should be touched on save. */
    _touches: any[] = [];
    /* The many to many relationship methods. */
    public static manyMethods: string[] = ['belongsToMany', 'morphToMany', 'morphedByMany'];
    /* The relation resolver callbacks. */
    static _relationResolvers: any[] = [];

    /* Get the joining table name for a many-to-many relation. */
    public JoiningTable(this: Model & _Self, related: typeof Model, instance: Model | null = null): string {
      const segments = [
        instance ? instance.JoiningTableSegment() : snakeCase(related.name),
        this.JoiningTableSegment(),
      ];
      segments.sort();
      return segments.join('_').toLowerCase();
    }

    /* Get this model's half of the intermediate table name for belongsToMany relationships. */
    public JoiningTableSegment(this: Model & _Self): string {
      return snakeCase(this.GetTable());
    }

    /* Determine if the model touches a given relation. */
    public Touches(relation: string): boolean {
      return this.GetTouchedRelations().includes(relation);
    }

    /* Touch the owning relations of the model. */
    public async TouchOwners(this: Model & _Self): Promise<void> {
      for (const relation of this.GetTouchedRelations()) {
        await this.NewRelation(relation).Touch();
        await this[relation];
        if (this[relation] instanceof _Self) {
          (this[relation] as Model).FireModelEvent('saved', false);
          await (this[relation] as HasRelationships).TouchOwners();
        } else if (isArray(this[relation])) {
          for (const it of this[relation]) {
            await it.TouchOwners();
          }
        }
      }
    }

    /* Get the polymorphic relationship columns. */
    _getMorphs(name: string, type: string, id: string): string[] {
      return [type || name + '_type', id || name + '_id'];
    }

    /*
     * @todo fixme maybe remove this.constructor.name
     * Get the class name for polymorphic relations.
     */
    public GetMorphClass(): string {
      const metas = reflector.annotations(this.constructor);
      const meta: TableAnnotation = findLast((it) => Table.isTypeOf(it), metas);

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

    /* Create a new model instance for a related model. */
    _newRelatedInstance(this: _Self & Model & this, clazz: typeof Model): Model {
      return tap(new clazz(), (instance) => {
        if (!instance.GetConnectionName()) {
          instance.SetConnection(this._connection);
        }
      });
    }

    NewRelation(this: Model & _Self, relation: string): Relation {
      const metadata = this.IsRelation(relation);
      if (metadata) {
        return (metadata as RelationColumnAnnotation)._getRelation(this, relation);
      }
      return undefined;
    }

    /* Get all the loaded relations for the instance. */
    public GetRelations(): Record<string, any> {
      return this._relations;
    }

    /* Get a specified relationship. */
    public GetRelation(relation: string): any {
      return this._relations[relation];
    }

    /* Determine if the given relation is loaded. */
    public RelationLoaded(key: string): boolean {
      return key in this._relations;
    }

    /* Set the given relationship on the model. */
    public SetRelation(relation: string, value: any): this {
      this._relations[relation] = value;
      return this;
    }

    /* Unset a loaded relationship. */
    public UnsetRelation(relation: string): this {
      delete this._relations[relation];
      return this;
    }

    /* Set the entire relations array on the model. */
    public SetRelations(relations: Record<string, Model | Model[]>): this {
      this._relations = relations;
      return this;
    }

    /* Duplicate the instance and unset all the loaded relations. */
    public WithoutRelations(this: _Self & Model & this) {
      const model = this.clone();
      return model.UnsetRelations();
    }

    /* Unset all the loaded relations for the instance. */
    public UnsetRelations(): this {
      this._relations = {};
      return this;
    }

    /* Get the relationships that are touched on save. */
    public GetTouchedRelations(): any[] {
      return this._touches;
    }

    /* Set the relationships that are touched on save. */
    public SetTouchedRelations(touches: any[]): this {
      this._touches = touches;
      return this;
    }
  };
}
