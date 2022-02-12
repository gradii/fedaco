import { wrap } from '../helper/arr'
import { ColumnDefinition } from './column-definition'
export class ForeignKeyDefinition extends ColumnDefinition {
  get deferrable() {
    return this.get('deferrable')
  }
  get initiallyImmediate() {
    return this.get('initiallyImmediate')
  }
  get on() {
    return this.get('on')
  }
  get onDelete() {
    return this.get('onDelete')
  }
  get onUpdate() {
    return this.get('onUpdate')
  }
  get references() {
    return this.get('references')
  }

  withDeferrable(value = true) {
    this.attributes['deferrable'] = value
    return this
  }

  withInitiallyImmediate(value = true) {
    this.attributes['initiallyImmediate'] = value
    return this
  }

  withOn(table) {
    this.attributes['on'] = table
    return this
  }

  withOnDelete(action) {
    this.attributes['onDelete'] = action
    return this
  }

  withOnUpdate(action) {
    this.attributes['onUpdate'] = action
    return this
  }

  withReferences(columns) {
    this.attributes['references'] = wrap(columns)
    return this
  }

  withCascadeOnUpdate() {
    return this.withOnUpdate('cascade')
  }

  withCascadeOnDelete() {
    return this.withOnDelete('cascade')
  }

  withRestrictOnDelete() {
    return this.withOnDelete('restrict')
  }

  withNullOnDelete() {
    return this.withOnDelete('set null')
  }
}
