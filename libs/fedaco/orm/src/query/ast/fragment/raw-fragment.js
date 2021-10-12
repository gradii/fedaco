import { SqlNode } from '../../sql-node';

export class RawFragment extends SqlNode {
  constructor(value) {
    super();
    this.value = value;
  }

  accept(visitor) {
    throw new Error('should not run');
  }
}
