/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { QueryBuilder } from '../query-builder/query-builder';
import type { FedacoBuilder } from './fedaco-builder';
import type { Relation } from './relations/relation';


export type FedacoBuilderCallBack =
  Function
  | ((builder?: FedacoBuilder | Relation | QueryBuilder) => any | void);

export type RelationCallBack = ((relation: Relation) => any | void);

export type FedacoRelationType<T extends any> = Promise<T> | T;

export type FedacoRelationListType<T extends any> = Promise<T[]> | T[];
