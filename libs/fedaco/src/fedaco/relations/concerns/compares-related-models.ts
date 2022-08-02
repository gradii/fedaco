/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isBlank, isNumber } from '@gradii/check-type';
import type { Constructor } from '../../../helper/constructor';
import type { Model } from '../../model';
import type { HasOne } from '../has-one';
import type { MorphOne } from '../morph-one';
import type { Relation } from '../relation';

export interface ComparesRelatedModels {
  is(model: Model | null): Model;

  /*Determine if the model is not the related instance of the relationship.*/
  isNot(model: Model | null): Model;

  /*Get the value of the parent model's key.*/
  getParentKey(): string;

  /*Get the value of the model's related key.*/
  _getRelatedKeyFrom(model: Model): string;

  /*Compare the parent key with the related key.*/
  _compareKeys(parentKey: any, relatedKey: any): boolean;
}

type ComparesRelatedModelsCtor = Constructor<ComparesRelatedModels>;

export function mixinComparesRelatedModels<T extends Constructor<any>>(base: T): ComparesRelatedModelsCtor & T {

  return class _Self extends base {

    /*Determine if the model is the related instance of the relationship.*/
    public async is(this: Relation & this, model: Model | null) {
      const match = !isBlank(model) && this._compareKeys(this.getParentKey(),
        this._getRelatedKeyFrom(
          model)) && this._related.getTable() === model.getTable() && this._related.getConnectionName() === model.getConnectionName();
      // @ts-ignore
      if (match && (this as HasOne | MorphOne).supportsPartialRelations && this.isOneOfMany()) {
        return this._query.whereKey(model.getKey()).exists();
      }
      return match;
    }

    /*Determine if the model is not the related instance of the relationship.*/
    public async isNot(this: Relation & this, model: Model | null) {
      return !(await this.is(model));
    }

    /*Compare the parent key with the related key.*/
    _compareKeys(parentKey: any, relatedKey: any): boolean {
      if (isBlank(parentKey) || isBlank(relatedKey)) {
        return false;
      }
      if (isNumber(parentKey) || isNumber(relatedKey)) {
        return /*cast type int*/ parentKey === /*cast type int*/ relatedKey;
      }
      return parentKey === relatedKey;
    }
  };
}
