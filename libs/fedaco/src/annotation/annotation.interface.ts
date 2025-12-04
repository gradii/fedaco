/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export interface FedacoAnnotation {}

export interface IDecorator<T extends FedacoAnnotation> {
  isTypeOf(obj: any): obj is T;

  metadataName: string;

  /**
   * See the `Pipe` decorator.
   */
  new (obj?: T): T;
}

export type FedacoDecorator<T extends FedacoAnnotation> = ((obj?: Omit<T, '_onRelation'>) => any) &
  Pick<IDecorator<T>, keyof IDecorator<T>>;
