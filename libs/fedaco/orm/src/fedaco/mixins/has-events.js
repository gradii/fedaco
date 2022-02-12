import { isAnyEmpty, isArray, isBlank, isObject } from '@gradii/check-type'
import { difference, uniq } from 'ramda'
export class NullDispatcher {
  constructor(dispatcher) {
    this.dispatcher = dispatcher
  }
  forget(event) {}
  until() {
    return true
  }
  dispatch() {}
}
export function mixinHasEvents(base) {
  return class _Self extends base {
    constructor() {
      super(...arguments)

      this._dispatchesEvents = {}

      this._observables = []
    }

    static observe(classes) {}

    static retrieved(callback) {
      this._registerModelEvent('retrieved', callback)
    }

    static saving(callback) {
      this._registerModelEvent('saving', callback)
    }

    static saved(callback) {
      this._registerModelEvent('saved', callback)
    }

    static updating(callback) {
      this._registerModelEvent('updating', callback)
    }

    static updated(callback) {
      this._registerModelEvent('updated', callback)
    }

    static creating(callback) {
      this._registerModelEvent('creating', callback)
    }

    static created(callback) {
      this._registerModelEvent('created', callback)
    }

    static replicating(callback) {
      this._registerModelEvent('replicating', callback)
    }

    static deleting(callback) {
      this._registerModelEvent('deleting', callback)
    }

    static deleted(callback) {
      this._registerModelEvent('deleted', callback)
    }

    static flushEventListeners() {
      if (!(this.dispatcher !== undefined)) {
        return
      }

      const instance = new this()
      for (const event of instance.getObservableEvents()) {
        this.dispatcher.forget(`fedaco.${event}: ${this.getTable()}`)
      }
      for (const event of Object.values(instance._dispatchesEvents)) {
        this.dispatcher.forget(event)
      }
    }

    static getEventDispatcher() {
      return this.dispatcher
    }

    static setEventDispatcher(dispatcher) {
      this.dispatcher = dispatcher
    }

    static unsetEventDispatcher() {
      this.dispatcher = null
    }

    static withoutEvents(callback) {
      const dispatcher = this.getEventDispatcher()
      if (dispatcher) {
        this.setEventDispatcher(new NullDispatcher(dispatcher))
      }
      try {
        return callback()
      } finally {
        if (dispatcher) {
          this.setEventDispatcher(dispatcher)
        }
      }
    }

    static _registerModelEvent(event, callback) {
      if (this.dispatcher !== undefined) {
        const name = this.prototype.constructor.name
        this.dispatcher.listen(`fedaco.${event}: ${name}`, callback)
      }
    }

    getObservableEvents() {
      return [
        ...[
          'retrieved',
          'creating',
          'created',
          'updating',
          'updated',
          'saving',
          'saved',
          'restoring',
          'restored',
          'replicating',
          'deleting',
          'deleted',
          'forceDeleted',
        ],
        ...this._observables,
      ]
    }

    setObservableEvents(observables) {
      this._observables = observables
      return this
    }

    addObservableEvents(observables) {
      this._observables = uniq([
        ...this._observables,
        ...(isArray(observables) ? observables : arguments),
      ])
    }

    removeObservableEvents(observables) {
      this._observables = difference(
        this._observables,
        isArray(observables) ? observables : [...arguments]
      )
    }

    _registerObserver(clazz) {
      for (const event of this.getObservableEvents()) {
        if (event in clazz) {
          this.constructor._registerModelEvent(event, (...args) =>
            clazz.prototype[event].apply()
          )
        }
      }
    }

    _fireModelEvent(event, halt = true) {
      if (!(this.constructor.dispatcher !== undefined)) {
        return true
      }
      const method = halt ? 'until' : 'dispatch'
      const result = this._filterModelEventResults(
        this._fireCustomModelEvent(event, method)
      )
      if (result === false) {
        return false
      }
      return !isAnyEmpty(result)
        ? result
        : this.constructor.dispatcher[method](
            `fedaco.${event}: ${this.getTable()}`,
            this
          )
    }

    _fireCustomModelEvent(event, method) {
      if (isBlank(this._dispatchesEvents[event])) {
        return
      }
      const result = this.constructor.dispatcher[method](
        new this._dispatchesEvents[event](this)
      )
      if (!isBlank(result)) {
        return result
      }
    }

    _filterModelEventResults(result) {
      if (isArray(result)) {
        result = result.filter((response) => !!response)
      }
      return result
    }

    _resolveObserverClassName(clazz) {
      if (isObject(clazz)) {
        return clazz.constructor
      }

      throw new Error(
        `InvalidArgumentException Unable to find observer: ${clazz}`
      )
    }
  }
}
