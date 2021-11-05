/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Collection } from '../../../define/collection';
import { Constructor } from '../../../helper/constructor';
import { Model } from '../../model';
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
    _formatRecordsList(records: any[]): any;
    _attachNew(records: any[], current: any[], touch?: boolean): any;
    updateExistingPivot(id: any, attributes: any[], touch?: boolean): any;
    _updateExistingPivotUsingCustomClass(id: any, attributes: any[], touch: boolean): any;
    attach(id: any, attributes?: any, touch?: boolean): any;
    _attachUsingCustomClass(id: any, attributes: any[]): any;
    _formatAttachRecords(ids: any[], attributes: any[]): any;
    _formatAttachRecord(key: number, value: any, attributes: any[], hasTimestamps: boolean): any;
    _extractAttachIdAndAttributes(key: any, value: any, attributes: any[]): any;
    _baseAttachRecord(id: number, timed: boolean): any;
    _addTimestampsToAttachment(record: any[], exists?: boolean): any;
    hasPivotColumn(column: string): any;
    detach(ids?: any, touch?: boolean): any;
    _detachUsingCustomClass(ids: any): any;
    _getCurrentlyAttachedPivots(): any;
    newPivot(attributes?: any[], exists?: boolean): any;
    newExistingPivot(attributes?: any[]): any;
    newPivotStatement(): any;
    newPivotStatementForId(id: any): any;
    newPivotQuery(): any;
    withPivot(columns: any[] | any, ...cols: any[]): any;
    _parseIds(value: any): any;
    _parseId(value: any): any;
    _castKeys(keys: any[]): any;
    _castKey(key: any): any;
    _castAttributes(attributes: any[]): any;
    _getTypeSwapValue(type: string, value: any): any;
}
declare type InteractsWithPivotTableCtor = Constructor<InteractsWithPivotTable>;
declare type PivotTableData = {
    attached: any[];
    detached: any[];
    updated?: any[];
};
export declare function mixinInteractsWithPivotTable<T extends Constructor<any>>(base: T): InteractsWithPivotTableCtor & T;
export {};
