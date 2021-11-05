/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../../helper/constructor';
import { FedacoBuilder } from '../../fedaco-builder';
import { Model } from '../../model';
export declare namespace AsPivot {
    function fromAttributes(parent: Model, attributes: any[], table: string, exists?: boolean): any;
    function fromRawAttributes(parent: Model, attributes: any[], table: string, exists: boolean): any;
}
export interface AsPivot extends Model {
    pivotParent: Model;
    _foreignKey: string;
    _relatedKey: string;
    _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;
    _setKeysForSaveQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;
    delete(): Promise<number | boolean>;
    _getDeleteQuery(): any;
    getTable(): string;
    getForeignKey(): any;
    getRelatedKey(): any;
    getOtherKey(): any;
    setPivotKeys(foreignKey: string, relatedKey: string): any;
    hasTimestampAttributes(attributes?: any[] | null): any;
    getCreatedAtColumn(): string;
    getUpdatedAtColumn(): string;
    getQueueableId(): number | string;
    newQueryForRestoration(ids: number[] | string[] | string): any;
    _newQueryForCollectionRestoration(ids: number[] | string[]): any;
    unsetRelations(): any;
}
export declare type AsPivotCtor = Constructor<AsPivot>;
export declare function mixinAsPivot<T extends Constructor<any>>(base: T): AsPivotCtor & T;
