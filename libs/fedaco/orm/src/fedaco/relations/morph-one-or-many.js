import { HasOneOrMany } from './has-one-or-many'
export class MorphOneOrMany extends HasOneOrMany {
  constructor(query, parent, type, id, localKey) {
    super(query, parent, id, localKey)
    this._morphType = type
    this._morphClass = parent.getMorphClass()
    this.addConstraints()
  }

  addConstraints() {
    if (this._morphType === undefined && this._morphClass === undefined) {
      return
    }
    if (this.constructor.constraints) {
      super.addConstraints()
      this._getRelationQuery().where(this._morphType, this._morphClass)
    }
  }

  addEagerConstraints(models) {
    super.addEagerConstraints(models)
    this._getRelationQuery().where(this._morphType, this._morphClass)
  }

  _setForeignAttributesForCreate(model) {
    model.setAttribute(this.getForeignKeyName(), this.getParentKey())
    model.setAttribute(this.getMorphType(), this._morphClass)
  }

  getRelationExistenceQuery(query, parentQuery, columns = ['*']) {
    return super
      .getRelationExistenceQuery(query, parentQuery, columns)
      .where(query.qualifyColumn(this.getMorphType()), this._morphClass)
  }

  getQualifiedMorphType() {
    return this._morphType
  }

  getMorphType() {
    return this._morphType.split('.').pop()
  }

  getMorphClass() {
    return this._morphClass
  }
}
