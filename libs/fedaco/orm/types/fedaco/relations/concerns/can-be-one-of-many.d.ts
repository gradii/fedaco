/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../../helper/constructor';
import { JoinClauseBuilder } from '../../../query-builder/query-builder';
import { FedacoBuilder } from '../../fedaco-builder';
export interface CanBeOneOfMany {
    ofMany(column?: string | any[] | null, aggregate?: string | Function | null, relation?: string | null): any;
    latestOfMany(column?: string | any[] | null, relation?: string | null): any;
    oldestOfMany(column?: string | any[] | null, relation?: string | null): any;
    _getDefaultOneOfManyJoinAlias(relation: string): any;
    _newOneOfManySubQuery(groupBy: string | any[], column?: string | null, aggregate?: string | null): any;
    _addOneOfManyJoinSubQuery(parent: FedacoBuilder, subQuery: FedacoBuilder, on: string): any;
    _mergeOneOfManyJoinsTo(query: any): any;
    _getRelationQuery(): any;
    getOneOfManySubQuery(): any;
    _qualifySubSelectColumn(column: string): any;
    _qualifyRelatedColumn(column: string): any;
    _guessRelationship(): any;
    isOneOfMany(): any;
    getRelationName(): any;
}
export declare function mixinCanBeOneOfMany<T extends Constructor<any>>(base: T): {
    new (...args: any[]): {
        [x: string]: any;
        _isOneOfMany: boolean;
        _relationName: string;
        _oneOfManySubQuery?: FedacoBuilder;
        addOneOfManySubQueryConstraints(query: FedacoBuilder, column?: string | null, aggregate?: string | null): void;
        getOneOfManySubQuerySelectColumns(): void;
        addOneOfManyJoinSubQueryConstraints(join: JoinClauseBuilder): void;
        ofMany(column: string | any, aggregate: string | Function, relation: string): this;
        latestOfMany(column?: string[] | string, relation?: string): this;
        oldestOfMany(column?: string[] | string, relation?: string): this;
        _newOneOfManySubQuery(groupBy: string | any[], column?: string, aggregate?: string): any;
        _addOneOfManyJoinSubQuery(parent: FedacoBuilder, subQuery: FedacoBuilder, on: string): void;
        _mergeOneOfManyJoinsTo(query: any): void;
        _getRelationQuery(): any;
        getOneOfManySubQuery(): FedacoBuilder<import("@gradii/fedaco").Model>;
        _qualifySubSelectColumn(column: string): string;
        _qualifyRelatedColumn(column: string): string;
        isOneOfMany(): boolean;
        getRelationName(): string;
    };
} & T;
