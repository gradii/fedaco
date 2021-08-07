import {
  makeDecorator,
  makePropDecorator,
  TypeDecorator
} from '@gradii/annotation';

export interface ColumnDecorator {

  (obj: Column): TypeDecorator;

  /**
   * See the `Pipe` decorator.
   */
  new(obj: Column): Column;
}

export interface Column {
  name: string;

}

export const Column: ColumnDecorator = makePropDecorator(
  'column',
  (p: Column) => ({ ...p }), undefined, undefined,
  (type: any, meta: Column) => _columnHandle(type, meta)
);

function _columnHandle(type, meta) {

}