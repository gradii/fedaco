/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
export interface FedacoAnnotation {}
export interface FedacoDecorator<T extends FedacoAnnotation> {
    (obj?: Omit<T, '_onRelation'>): any;
    isTypeOf(obj: any): obj is T;
    metadataName: string;

    new (obj?: T): T;
}
