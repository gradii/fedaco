/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { FedacoBuilder } from '../fedaco/fedaco-builder';
import { FedacoDecorator } from './annotation.interface';
export interface ScopeAnnotation {
    isScope?: boolean;
    query: (query: FedacoBuilder, ...args: any[]) => void;
}
export declare const Scope: FedacoDecorator<Omit<ScopeAnnotation, 'isScope'>>;
