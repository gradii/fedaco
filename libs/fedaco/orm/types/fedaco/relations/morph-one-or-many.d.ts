/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { HasOneOrMany } from './has-one-or-many';
export declare class MorphOneOrMany extends HasOneOrMany {
    protected morphType: string;
    protected morphClass: string;
    constructor(query: FedacoBuilder, parent: Model, type: string, id: string, localKey: string);
    addConstraints(): void;
    addEagerConstraints(models: any[]): void;
    _setForeignAttributesForCreate(model: Model): void;
    getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder<Model>;
    getQualifiedMorphType(): string;
    getMorphType(): string;
    getMorphClass(): string;
}
