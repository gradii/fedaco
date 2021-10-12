import { isArray } from '@gradii/check-type';
import { difference } from 'ramda';
import { value } from '../../helper/fn';

export function mixinHidesAttributes(base) {

  return class _Self extends base {
    constructor() {
      super(...arguments);

      this._hidden = [];

      this._visible = [];
    }

    getHidden() {
      return this._hidden;
    }

    setHidden(hidden) {
      this._hidden = hidden;
      return this;
    }

    getVisible() {
      return this._visible;
    }

    setVisible(visible) {
      this._visible = visible;
      return this;
    }

    makeVisible(attributes) {
      attributes = isArray(attributes) ? attributes : arguments;
      this._hidden = difference(this._hidden, attributes);
      if (this._visible.length) {
        this._visible = [...this._visible, ...attributes];
      }
      return this;
    }

    makeVisibleIf(condition, attributes) {
      return value(condition, this) ? this.makeVisible(attributes) : this;
    }

    makeHidden(attributes) {
      this._hidden = [...this._hidden, ...(isArray(attributes) ? attributes : arguments)];
      return this;
    }

    makeHiddenIf(condition, attributes) {
      return value(condition, this) ? this.makeHidden(attributes) : this;
    }
  };
}
