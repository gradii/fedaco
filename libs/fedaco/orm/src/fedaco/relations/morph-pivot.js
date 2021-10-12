import { isArray } from '@gradii/check-type';
import { tap } from 'ramda';
import { Pivot } from './pivot';

export class MorphPivot extends Pivot {

  setKeysForSaveQuery(query) {
    query.where(this.morphType, this.morphClass);
    return super._setKeysForSaveQuery(query);
  }

  setKeysForSelectQuery(query) {
    query.where(this.morphType, this.morphClass);
    return super._setKeysForSelectQuery(query);
  }

  delete() {
    if (this._attributes[this.getKeyName()] !== undefined) {
      return super.delete();
    }
    if (this._fireModelEvent('deleting') === false) {
      return 0;
    }
    const query = this.getDeleteQuery();
    query.where(this.morphType, this.morphClass);
    return tap(() => {
      this._fireModelEvent('deleted', false);
    }, query.delete());
  }

  getMorphType() {
    return this.morphType;
  }

  setMorphType(morphType) {
    this.morphType = morphType;
    return this;
  }

  setMorphClass(morphClass) {
    this.morphClass = morphClass;
    return this;
  }

  getQueueableId() {
    if (this._attributes[this.getKeyName()] !== undefined) {
      return this.getKey();
    }
    return `${this.foreignKey}:${this.getAttribute(this.foreignKey)}:${this.relatedKey}:${this.getAttribute(this.relatedKey)}:${this.morphType}:${this.morphClass}`;
  }

  newQueryForRestoration(ids) {
    if (isArray(ids)) {
      return this._newQueryForCollectionRestoration(ids);
    }
    if (!ids.includes(':')) {
      return super.newQueryForRestoration(ids);
    }
    const segments = ids.split(':');
    return this.newQueryWithoutScopes().where(segments[0], segments[1]).where(segments[2], segments[3]).where(segments[4], segments[5]);
  }

  newQueryForCollectionRestoration(ids) {
    if (!ids[0].includes(':')) {
      return super.newQueryForRestoration(ids);
    }
    const query = this.newQueryWithoutScopes();
    for (const id of ids) {
      const segments = id.split(':');
      query.orWhere(q => {
        return q.where(segments[0], segments[1])
          .where(segments[2], segments[3])
          .where(segments[4], segments[5]);
      });
    }
    return query;
  }
}
