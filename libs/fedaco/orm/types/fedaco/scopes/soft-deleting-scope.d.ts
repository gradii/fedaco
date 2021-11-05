/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoBuilder } from '../fedaco-builder';
import { Model } from '../model';
import { Scope } from '../scope';
export declare function restore(): (builder: FedacoBuilder) => Promise<any>;
export declare function withTrashed(withTrashed?: boolean): (builder: FedacoBuilder) => FedacoBuilder<Model>;
export declare function withoutTrashed(): (builder: FedacoBuilder) => FedacoBuilder<Model>;
export declare function onlyTrashed(): (builder: FedacoBuilder) => FedacoBuilder<Model>;
export declare class SoftDeletingScope extends Scope {
    protected extensions: string[];
    apply(builder: FedacoBuilder, model: Model): void;
    extend(builder: FedacoBuilder): void;
    protected getDeletedAtColumn(builder: FedacoBuilder): any;
}
