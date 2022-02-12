/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../../helper/constructor';
import { JoinClauseBuilder } from '../../../query-builder/query-builder';
import { FedacoBuilder } from '../../fedaco-builder';
import { MorphOneOrMany } from '../morph-one-or-many';
export interface CanBeOneOfMany {
    ofMany(
        column?: string | any[] | null,
        aggregate?: string | Function | null,
        relation?: string | null
    ): this;
    latestOfMany(
        column?: string | any[] | null,
        relation?: string | null
    ): this;
    oldestOfMany(
        column?: string | any[] | null,
        relation?: string | null
    ): this;
    _newOneOfManySubQuery(
        groupBy: string | any[],
        column?: string | null,
        aggregate?: string | null
    ): FedacoBuilder;
    _addOneOfManyJoinSubQuery(
        parent: FedacoBuilder,
        subQuery: FedacoBuilder,
        on: string
    ): void;
    _mergeOneOfManyJoinsTo(query: FedacoBuilder): void;
    _getRelationQuery(): FedacoBuilder;
    getOneOfManySubQuery(): FedacoBuilder;
    _qualifySubSelectColumn(column: string): string;
    _qualifyRelatedColumn(column: string): string;
    isOneOfMany(): boolean;
    getRelationName(): string;
}
export declare function mixinCanBeOneOfMany<T extends Constructor<any>>(
    base: T
): {
    new (...args: any[]): {
        [x: string]: any;
        _isOneOfMany: boolean;
        _relationName: string;
        _oneOfManySubQuery?: FedacoBuilder;
        addOneOfManySubQueryConstraints(
            query: FedacoBuilder,
            column?: string | null,
            aggregate?: string | null
        ): void;
        getOneOfManySubQuerySelectColumns(): void;
        addOneOfManyJoinSubQueryConstraints(join: JoinClauseBuilder): void;
        ofMany(
            column: string | any,
            aggregate: string | Function,
            relation: string
        ): this;
        latestOfMany(column?: string[] | string, relation?: string): this;
        oldestOfMany(column?: string[] | string, relation?: string): this;
        _newOneOfManySubQuery(
            this: MorphOneOrMany & any,
            groupBy: string | any[],
            column?: string,
            aggregate?: string
        ): FedacoBuilder;
        _addOneOfManyJoinSubQuery(
            parent: FedacoBuilder,
            subQuery: FedacoBuilder,
            on: string
        ): void;
        _mergeOneOfManyJoinsTo(query: FedacoBuilder): void;
        _getRelationQuery(): FedacoBuilder;
        getOneOfManySubQuery(): FedacoBuilder;
        _qualifySubSelectColumn(column: string): string;
        _qualifyRelatedColumn(column: string): string;
        isOneOfMany(): boolean;
        getRelationName(): string;
    };
} & T;
