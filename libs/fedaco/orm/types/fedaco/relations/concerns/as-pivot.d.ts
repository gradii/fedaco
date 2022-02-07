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
    function fromRawAttributes(parent: Model, attributes: any, table: string, exists: boolean): any;
}
export interface AsPivot extends Model {
    pivotParent: Model;
    _foreignKey: string;
    _relatedKey: string;
    _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;
    _setKeysForSaveQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;
    delete(): Promise<number | boolean>;
    _getDeleteQuery(): FedacoBuilder;
    getTable(): string;
    getForeignKey(): string;
    getRelatedKey(): string;
    getOtherKey(): string;
    setPivotKeys(foreignKey: string, relatedKey: string): this;
    hasTimestampAttributes(attributes?: any[] | null): boolean;
    getCreatedAtColumn(): string;
    getUpdatedAtColumn(): string;
    getQueueableId(): number | string;
    newQueryForRestoration(ids: number[] | string[] | string): FedacoBuilder<this>;
    _newQueryForCollectionRestoration(ids: number[] | string[]): FedacoBuilder<this>;
    unsetRelations(): this;
}
export declare type AsPivotCtor = Constructor<AsPivot>;
export declare function mixinAsPivot<T extends Constructor<any>>(base: T): AsPivotCtor & T;
