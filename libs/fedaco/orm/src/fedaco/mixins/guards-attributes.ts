import { Constructor } from '../../helper/constructor';

export interface GuardsAttributes {
  getFillable(): this

  totallyGuarded(): this

  getGuarded(): this

  fillableFromArray(attributes: any[]): this
}

export type GuardsAttributesCtor = Constructor<GuardsAttributes>;


export function mixinGuardsAttributes<T extends Constructor<{}>>(base: T) {
  return class _Self extends base {
    /*The attributes that are mass assignable.*/
    _fillable: any[] = [];
    /*The attributes that aren't mass assignable.*/
    _guarded: any[] = ['*'];

    /*Get the fillable attributes for the model.*/
    getFillable() {
      return this._fillable;
    }

    totallyGuarded() {
      return this.getFillable().length === 0 && this.getGuarded() == ['*'];
    }

    getGuarded() {
      return this._guarded;
    }

    fillableFromArray(attributes: any[]) {
      //todo
      // if (this.getFillable().length > 0 && !GuardsAttributes.unguarded) {
      //   return array_intersect_key(attributes, array_flip(this.getFillable()));
      // }
      return attributes;
    }
  };
}