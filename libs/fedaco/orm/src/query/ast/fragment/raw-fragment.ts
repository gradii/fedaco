import { SqlNode } from '../../sql-node';
import { SqlVisitor } from '../../sql-visitor';


export class RawFragment extends SqlNode {
  constructor(public value: string | number | boolean) {
    super();
  }

  accept(visitor: SqlVisitor) {
    throw new Error('should not run');
  }
}