/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoBuilder } from './fedaco-builder';
import { Model } from './model';
export interface Scope {
    apply(builder: FedacoBuilder, model: Model): any;
}
export declare abstract class Scope {}
