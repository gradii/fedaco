/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
import { Builder } from '../../query-builder/builder';
import { FedacoBuilder } from '../fedaco-builder';
import { BelongsTo } from '../relations/belongs-to';
import { MorphTo } from '../relations/morph-to';
import { Relation } from '../relations/relation';
export declare type RelationParam = {
    [key: string]: (q: FedacoBuilder) => void;
} | string;
export declare type RelationParams = RelationParam[] | RelationParam;
export interface QueriesRelationShips {
    has(relation: Relation | string, operator?: string, count?: number, conjunction?: string, callback?: Function | null): this;
    _hasNested(relations: string, operator?: string, count?: number, conjunction?: string, callback?: Function | null): this;
    orHas(relation: string, operator?: string, count?: number): this;
    doesntHave(relation: string, conjunction?: string, callback?: Function | null): this;
    orDoesntHave(relation: string): this;
    whereHas(relation: string | Relation, callback?: Function | null, operator?: string, count?: number): this;
    orWhereHas(relation: string, callback?: Function | null, operator?: string, count?: number): this;
    whereDoesntHave(relation: string, callback?: Function | null): this;
    orWhereDoesntHave(relation: string, callback?: Function | null): this;
    hasMorph(relation: MorphTo | string, types: string[], operator?: string, count?: number, conjunction?: string, callback?: Function | null): this;
    _getBelongsToRelation(relation: MorphTo, type: string): BelongsTo;
    orHasMorph(relation: MorphTo | string, types: string[], operator?: string, count?: number): this;
    doesntHaveMorph(relation: MorphTo | string, types: string[], conjunction?: string, callback?: Function): this;
    orDoesntHaveMorph(relation: MorphTo | string, types: string[]): this;
    whereHasMorph(relation: MorphTo | string, types: string[], callback?: Function | null, operator?: string, count?: number): this;
    orWhereHasMorph(relation: MorphTo | string, types: string[], callback?: Function | null, operator?: string, count?: number): this;
    whereDoesntHaveMorph(relation: MorphTo | string, types: string[], callback?: Function | null): this;
    orWhereDoesntHaveMorph(relation: MorphTo | string, types: string[], callback?: Function | null): this;
    withAggregate(relations: any, column: string, func?: string): this;
    withCount(relations: any): this;
    withMax(relation: string | any[], column: string): this;
    withMin(relation: string | any[], column: string): this;
    withSum(relation: string | any[], column: string): this;
    withAvg(relation: string | any[], column: string): this;
    withExists(relation: RelationParams): this;
    addHasWhere(hasQuery: FedacoBuilder, relation: Relation, operator: string, count: number, conjunction: string): this;
    mergeConstraintsFrom(from: FedacoBuilder): FedacoBuilder;
    addWhereCountQuery(query: Builder, operator?: string, count?: number, conjunction?: string): this;
    _getRelationWithoutConstraints<T extends Relation>(relation: string): T;
    _canUseExistsForExistenceCheck(operator: string, count: number): boolean;
}
export declare type QueriesRelationShipsCtor = Constructor<QueriesRelationShips>;
export declare function mixinQueriesRelationShips<T extends Constructor<any>>(base: T): QueriesRelationShipsCtor & T;
