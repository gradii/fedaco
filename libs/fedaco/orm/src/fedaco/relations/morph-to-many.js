import { BelongsToMany } from './belongs-to-many';

export class MorphToMany extends BelongsToMany {

  constructor(query, parent, name, table, foreignPivotKey, relatedPivotKey, parentKey, relatedKey, relationName = null, inverse = false) {
    super(query, parent, table, foreignPivotKey, relatedPivotKey, parentKey, relatedKey, relationName);
    this.inverse = inverse;
    this.morphType = name + '_type';
    this.morphClass = inverse ?
      query.getModel().getMorphClass() :
      parent.getMorphClass();
  }
}
