/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoBuilder } from '../fedaco-builder';
import { Pivot } from './pivot';
export declare class MorphPivot extends Pivot {
    protected morphType: string;
    protected morphClass: string;
    _setKeysForSaveQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;
    _setKeysForSelectQuery(query: FedacoBuilder<this>): FedacoBuilder<this>;
    delete(): Promise<any>;
    getMorphType(): string;
    setMorphType(morphType: string): this;
    setMorphClass(morphClass: string): this;
    getQueueableId(): any;
    newQueryForRestoration(ids: number[] | string[] | string): FedacoBuilder<this>;
    protected newQueryForCollectionRestoration(ids: any[]): FedacoBuilder<this>;
}
