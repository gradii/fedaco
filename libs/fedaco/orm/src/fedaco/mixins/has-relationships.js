import { __awaiter } from 'tslib'
import { reflector } from '@gradii/annotation'
import { isArray, isString } from '@gradii/check-type'
import { findLast, tap } from 'ramda'
import { Table } from '../../annotation/table/table'
import { snakeCase } from '../../helper/str'
import { Relation } from '../relations/relation'

export function mixinHasRelationships(base) {
  var _a

  return (
    (_a = class _Self extends base {
      constructor() {
        super(...arguments)

        this._relations = {}

        this._touches = []
      }

      joiningTable(related, instance = null) {
        const segments = [
          instance ? instance.joiningTableSegment() : snakeCase(related.name),
          this.joiningTableSegment(),
        ]
        segments.sort()
        return segments.join('_').toLowerCase()
      }

      joiningTableSegment() {
        return snakeCase(this.getTable())
      }

      touches(relation) {
        return this.getTouchedRelations().includes(relation)
      }

      touchOwners() {
        return __awaiter(this, void 0, void 0, function* () {
          for (const relation of this.getTouchedRelations()) {
            yield this.newRelation(relation).touch()
            yield this[relation]
            if (this[relation] instanceof _Self) {
              this[relation].fireModelEvent('saved', false)
              yield this[relation].touchOwners()
            } else if (isArray(this[relation])) {
              for (const it of this[relation]) {
                yield it.touchOwners()
              }
            }
          }
        })
      }

      _getMorphs(name, type, id) {
        return [type || name + '_type', id || name + '_id']
      }

      getMorphClass() {
        const metas = reflector.annotations(this.constructor)
        const meta = findLast((it) => Table.isTypeOf(it), metas)
        if (meta && isString(meta.morphTypeName)) {
          return meta.morphTypeName
        } else {
          const morphMap = Relation.morphMap()
          for (const [key, value] of Object.entries(morphMap)) {
            if (this.constructor === value) {
              return key
            }
          }
        }
        return this.constructor.name
      }

      _newRelatedInstance(clazz) {
        return tap((instance) => {
          if (!instance.getConnectionName()) {
            instance.setConnection(this._connection)
          }
        }, new clazz())
      }
      newRelation(relation) {
        const metadata = this.isRelation(relation)
        if (metadata) {
          return metadata._getRelation(this, relation)
        }
        return undefined
      }

      getRelations() {
        return this._relations
      }

      getRelation(relation) {
        return this._relations[relation]
      }

      relationLoaded(key) {
        return key in this._relations
      }

      setRelation(relation, value) {
        this._relations[relation] = value
        return this
      }

      unsetRelation(relation) {
        delete this._relations[relation]
        return this
      }

      setRelations(relations) {
        this._relations = relations
        return this
      }

      withoutRelations() {
        const model = this.clone()
        return model.unsetRelations()
      }

      unsetRelations() {
        this._relations = []
        return this
      }

      getTouchedRelations() {
        return this._touches
      }

      setTouchedRelations(touches) {
        this._touches = touches
        return this
      }
    }),
    (_a.manyMethods = ['belongsToMany', 'morphToMany', 'morphedByMany']),
    (_a._relationResolvers = []),
    _a
  )
}
