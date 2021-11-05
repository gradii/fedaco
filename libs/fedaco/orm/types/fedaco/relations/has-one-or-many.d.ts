/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { Constructor } from '../../helper/constructor';
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { Relation } from './relation';
export interface HasOneOrMany extends Constructor<Relation> {
    make(attributes?: any): any;
    makeMany(records: []): any;
    addConstraints(): void;
    addEagerConstraints(models: any[]): void;
    matchOne(models: any[], results: Collection, relation: string): any[];
    matchMany(models: any[], results: Collection, relation: string): any[];
    matchOneOrMany(models: any[], results: Collection, relation: string, type: string): any[];
    getRelationValue(dictionary: any, key: string, type: string): any;
    buildDictionary(results: Collection): any;
    findOrNew(id: any, columns?: any[]): Promise<any>;
    firstOrNew(attributes?: any, values?: any): Promise<any>;
    firstOrCreate(attributes?: any, values?: any): Promise<any>;
    updateOrCreate(attributes: any, values?: any): Promise<any>;
    save(model: Model): Promise<any>;
    saveMany(models: any[]): Promise<any[]>;
    create(attributes?: any): Promise<any>;
    createMany(records: any[]): Promise<any>;
    getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): any;
    getRelationExistenceQueryForSelfRelation(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): any;
    getExistenceCompareKey(): string;
    getParentKey(): any;
    getQualifiedParentKeyName(): any;
    getForeignKeyName(): any;
    getQualifiedForeignKeyName(): string;
    getLocalKeyName(): string;
}
declare const HasOneOrMany_base: import("@gradii/fedaco/src/fedaco/relations/concerns/interacts-with-dictionary").InteractsWithDictionaryCtor & typeof Relation;
export declare class HasOneOrMany extends HasOneOrMany_base {
    protected _foreignKey: string;
    protected _localKey: string;
    constructor(query: FedacoBuilder, parent: Model, foreignKey: string, localKey: string);
    _setForeignAttributesForCreate(model: Model): void;
}
export {};
