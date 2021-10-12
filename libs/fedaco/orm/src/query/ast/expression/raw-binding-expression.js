import { RawExpression } from './raw-expression';

export class RawBindingExpression extends RawExpression {
  constructor(raw, bindings) {
    super(raw.value);
    this.raw = raw;
    this.bindings = bindings;
  }

  accept(visitor) {
    return visitor.visitRawBindingExpression(this);
  }
}
