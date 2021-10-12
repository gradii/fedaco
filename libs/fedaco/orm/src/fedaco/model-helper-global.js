import { Pivot } from './relations/pivot';
import { fromAttributes, fromRawAttributes } from './relations/pivot-helper';

export function newPivot(parent, attributes, table, exists, using) {
  return using ?
    fromRawAttributes(using, parent, attributes, table, exists) :
    fromAttributes(Pivot, parent, attributes, table, exists);
}
