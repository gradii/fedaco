import { plural } from '../helper/pluralize';
import { ColumnDefinition } from './column-definition';

export class ForeignIdColumnDefinition extends ColumnDefinition {

  constructor(blueprint, attributes = {}) {
    super(attributes);
    this.blueprint = blueprint;
  }

  withConstrained(table = null, column = 'id') {
    return this.withReferences(column).withOn(table !== null && table !== void 0 ? table : plural(this.name.lastIndexOf(`_${column}`) > 0 ?
      this.name.substring(0, this.name.lastIndexOf(`_${column}`)) : this.name));
  }

  withReferences(column) {
    return this.blueprint.foreign(this.name).withReferences(column);
  }
}
