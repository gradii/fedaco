import { HasOneOrMany } from './has-one-or-many';

export class MorphOneOrMany extends HasOneOrMany {

  constructor(query, parent, type, id, localKey) {
    super(query, parent, id, localKey);
    this.morphType = type;
    this.morphClass = parent.getMorphClass();
    this.addConstraints();
  }

  addConstraints() {
    if (this.morphType === undefined && this.morphClass === undefined) {

      return;
    }
    if (this.constructor.constraints) {
      super.addConstraints();
      this.getRelationQuery().where(this.morphType, this.morphClass);
    }
  }

  addEagerConstraints(models) {
    super.addEagerConstraints(models);
    this.getRelationQuery().where(this.morphType, this.morphClass);
  }

  setForeignAttributesForCreate(model) {
    model.setAttribute(this.getForeignKeyName(), this.getParentKey());
    model.setAttribute(this.getMorphType(), this.morphClass);
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    return super.getRelationExistenceQuery(query, parentQuery, columns).where(query.qualifyColumn(this.getMorphType()), this.morphClass);
  }

  getQualifiedMorphType() {
    return this.morphType;
  }

  getMorphType() {
    return this.morphType.split('.').pop();
  }

  getMorphClass() {
    return this.morphClass;
  }
}
