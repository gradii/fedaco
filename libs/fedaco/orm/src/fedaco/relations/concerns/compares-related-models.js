import { isBlank, isNumber } from '@gradii/check-type';

export function mixinComparesRelatedModels(base) {
  return class _Self extends base {

    is(model) {
      const match = !isBlank(model) && this._compareKeys(this.getParentKey(), this._getRelatedKeyFrom(model)) && this._related.getTable() === model.getTable() && this._related.getConnectionName() === model.getConnectionName();

      if (match && this.supportsPartialRelations && this.isOneOfMany()) {
        return this._query.whereKey(model.getKey()).exists();
      }
      return match;
    }

    isNot(model) {
      return !this.is(model);
    }

    _compareKeys(parentKey, relatedKey) {
      if (!parentKey.length || !relatedKey.length) {
        return false;
      }
      if (isNumber(parentKey) || isNumber(relatedKey)) {
        return parentKey === relatedKey;
      }
      return parentKey === relatedKey;
    }
  };
}
