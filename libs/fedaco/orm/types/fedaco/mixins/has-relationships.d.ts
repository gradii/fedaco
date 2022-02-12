/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { Model } from '../model';
import { BelongsTo } from '../relations/belongs-to';
import { BelongsToMany } from '../relations/belongs-to-many';
import { HasMany } from '../relations/has-many';
import { HasManyThrough } from '../relations/has-many-through';
import { HasOne } from '../relations/has-one';
import { HasOneOrMany } from '../relations/has-one-or-many';
import { HasOneThrough } from '../relations/has-one-through';
import { MorphMany } from '../relations/morph-many';
import { MorphOne } from '../relations/morph-one';
import { MorphOneOrMany } from '../relations/morph-one-or-many';
import { MorphPivot } from '../relations/morph-pivot';
import { MorphTo } from '../relations/morph-to';
import { MorphToMany } from '../relations/morph-to-many';
export interface HasRelationships {
    _relations: any;
    _touches: string[];
    joiningTable(related: typeof Model, instance?: Model | null): string;
    joiningTableSegment(): string;
    touches(relation: string): boolean;
    touchOwners(): Promise<void>;
    _getMorphs(name: string, type: string, id: string): string[];
    getMorphClass(): string;
    _newRelatedInstance(this: Model & this, clazz: typeof Model): Model;
    newRelation<
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
            MorphPivot &
            MorphTo &
            MorphToMany,
        K extends keyof this
    >(
        relation: K
    ): T;
    getRelations(): Record<string, any>;
    getRelation(relation: string): any;
    relationLoaded(key: string): boolean;
    setRelation(relation: string, value: any): this;
    unsetRelation(relation: string): this;
    setRelations(relations: any[]): this;
    withoutRelations(): this;
    unsetRelations(): this;
    getTouchedRelations(): any[];
    setTouchedRelations(touches: any[]): this;
}
declare type HasRelationshipsCtor = Constructor<HasRelationships>;

export declare function mixinHasRelationships<T extends Constructor<{}>>(
    base: T
): HasRelationshipsCtor & T;
export {};
