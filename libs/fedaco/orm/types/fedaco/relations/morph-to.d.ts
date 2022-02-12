/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { BelongsTo } from './belongs-to';
export declare class MorphTo extends BelongsTo {
    protected _morphType: string;
    protected _models: Collection;
    protected _dictionary: Record<any, any>;
    protected _macroBuffer: any[];
    protected _morphableEagerLoads: Map<any, any>;
    protected _morphableEagerLoadCounts: Map<any, any>;
    protected _morphableConstraints: Map<any, any>;
    constructor(
        query: FedacoBuilder,
        parent: Model,
        foreignKey: string,
        ownerKey: string,
        type: string,
        relation: string
    );
    select(columns?: string[]): this;
    selectRaw(expression: string, bindings?: any): this;
    selectSub(query: any, as: string): this;
    addSelect(column: any): this;
    withoutGlobalScopes(scopes?: any[]): void;
    addEagerConstraints(models: any[]): void;
    protected buildDictionary(models: Collection): void;
    getEager(): Promise<Collection>;
    protected getResultsByType(clazz: string): Promise<Model[]>;
    protected gatherKeysByType(type: string, keyType: string): string[];
    _getActualClassNameForMorph(key: string): any;
    createModelByType(type: string): any;
    match(models: any[], results: Collection, relation: string): any[];
    protected matchToMorphParents(type: string, results: Collection): void;
    associate(model: Model): Model;
    dissociate(): Model;
    touch(): Promise<void>;
    protected newRelatedInstanceFor(parent: Model): Model;
    getMorphType(): string;
    getDictionary(): Record<any, any>;
    morphWith(_with: Map<any, any>): this;
    morphWithCount(withCount: Map<any, any>): this;
    constrain(callbacks: Map<any, any>): this;
    protected replayMacros(query: FedacoBuilder): FedacoBuilder<Model>;
}
