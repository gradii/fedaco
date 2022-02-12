/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { QueryBuilder } from '../query-builder/query-builder';
import type { FedacoBuilder } from './fedaco-builder';
import type { Relation } from './relations/relation';
export declare type FedacoBuilderCallBack = Function | ((builder?: FedacoBuilder | Relation | QueryBuilder) => any | void);
export declare type RelationCallBack = ((relation: Relation) => any | void);
export declare type FedacoRelationType<T extends any> = Promise<T> | T;
export declare type FedacoRelationListType<T extends any> = Promise<T[]> | T[];
