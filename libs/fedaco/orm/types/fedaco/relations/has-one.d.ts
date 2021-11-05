/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../define/collection';
import { JoinClauseBuilder } from '../../query-builder/query-builder';
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { HasOneOrMany } from './has-one-or-many';
declare const HasOne_base: (new (...args: any[]) => import("@gradii/fedaco/src/fedaco/relations/concerns/compares-related-models").ComparesRelatedModels) & {
    new (...args: any[]): {
        [x: string]: any;
        _isOneOfMany: boolean;
        _relationName: string;
        _oneOfManySubQuery?: FedacoBuilder<Model>;
        addOneOfManySubQueryConstraints(query: FedacoBuilder<Model>, column?: string, aggregate?: string): void;
        getOneOfManySubQuerySelectColumns(): void;
        addOneOfManyJoinSubQueryConstraints(join: JoinClauseBuilder): void;
        ofMany(column: any, aggregate: string | Function, relation: string): any;
        latestOfMany(column?: string | string[], relation?: string): any;
        oldestOfMany(column?: string | string[], relation?: string): any;
        _newOneOfManySubQuery(groupBy: string | any[], column?: string, aggregate?: string): any;
        _addOneOfManyJoinSubQuery(parent: FedacoBuilder<Model>, subQuery: FedacoBuilder<Model>, on: string): void;
        _mergeOneOfManyJoinsTo(query: any): void;
        _getRelationQuery(): any;
        getOneOfManySubQuery(): FedacoBuilder<Model>;
        _qualifySubSelectColumn(column: string): string;
        _qualifyRelatedColumn(column: string): string;
        isOneOfMany(): boolean;
        getRelationName(): string;
    };
} & (new (...args: any[]) => import("@gradii/fedaco/src/fedaco/relations/concerns/supports-default-models").SupportsDefaultModels) & typeof HasOneOrMany;
export declare class HasOne extends HasOne_base {
    supportsPartialRelations: boolean;
    getResults(): Promise<Model>;
    initRelation(models: any[], relation: string): any[];
    match(models: any[], results: Collection, relation: string): any[];
    getRelationExistenceQuery(query: FedacoBuilder, parentQuery: FedacoBuilder, columns?: any[] | any): FedacoBuilder<Model>;
    addOneOfManySubQueryConstraints(query: FedacoBuilder, column?: string | null, aggregate?: string | null): void;
    getOneOfManySubQuerySelectColumns(): string;
    addOneOfManyJoinSubQueryConstraints(join: JoinClauseBuilder): void;
    newRelatedInstanceFor(parent: Model): any;
    _getRelatedKeyFrom(model: Model): any;
}
export {};
