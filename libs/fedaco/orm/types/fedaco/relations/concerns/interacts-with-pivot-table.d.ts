/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../../define/collection';
import { Constructor } from '../../../helper/constructor';
import { QueryBuilder } from '../../../query-builder/query-builder';
import { Model } from '../../model';
import type { Pivot } from '../pivot';
import type { AsPivot } from './as-pivot';
export interface InteractsWithPivotTable {
    /**
     * Toggles a model (or models) from the parent.
     * Each existing model is detached, and non existing ones are attached.
     */
    toggle(ids: any, touch?: boolean): Promise<{
        attached: any[];
        detached: any[];
    }>;
    syncWithoutDetaching(ids: Collection | Model | any[]): Promise<PivotTableData>;
    sync(ids: Collection | Model | any[], detaching?: boolean): Promise<PivotTableData>;
    syncWithPivotValues(ids: Collection | Model | any[], values: any[], detaching?: boolean): Promise<Record<string, any>>;
    _formatRecordsList(records: any[]): Record<string, any>;
    _attachNew(records: any[], current: any[], touch?: boolean): PivotTableData;
    updateExistingPivot(id: any, attributes: any[], touch?: boolean): Promise<any>;
    _updateExistingPivotUsingCustomClass(id: any, attributes: any[], touch: boolean): Promise<any>;
    attach(id: any, attributes?: any, touch?: boolean): Promise<void>;
    _attachUsingCustomClass(id: any, attributes: any[]): Promise<void>;
    _formatAttachRecords(ids: any[], attributes: any[]): any[];
    _formatAttachRecord(key: number, value: any, attributes: any[], hasTimestamps: boolean): Record<string, any>;
    _extractAttachIdAndAttributes(key: any, value: any, attributes: any[]): [string, any];
    _baseAttachRecord(id: string | number, timed: boolean): Record<string, any>;
    _addTimestampsToAttachment(record: any[], exists?: boolean): Record<string, any>;
    hasPivotColumn(column: string): boolean;
    detach(ids?: any, touch?: boolean): Promise<any>;
    _detachUsingCustomClass(ids: any): Promise<number>;
    _getCurrentlyAttachedPivots(): Promise<any[]>;
    newPivot(attributes?: any[], exists?: boolean): AsPivot | Pivot;
    newExistingPivot(attributes?: any[]): AsPivot | Pivot;
    newPivotStatement(): QueryBuilder;
    newPivotStatementForId(id: any): QueryBuilder;
    newPivotQuery(): QueryBuilder;
    withPivot(columns: any[] | any, ...cols: any[]): this;
    _parseIds(value: any): any[];
    _parseId(value: any): any;
    _castKeys(keys: any[]): any[];
    _castKey(key: any): any;
    _castAttributes(attributes: any[]): Model | Record<string, any>;
    _getTypeSwapValue(type: string, value: any): string | number;
}
declare type InteractsWithPivotTableCtor = Constructor<InteractsWithPivotTable>;
declare type PivotTableData = {
    attached: any[];
    detached: any[];
    updated?: any[];
};
export declare function mixinInteractsWithPivotTable<T extends Constructor<any>>(base: T): InteractsWithPivotTableCtor & T;
export {};
