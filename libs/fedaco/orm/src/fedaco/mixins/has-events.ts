import { Constructor } from '../../helper/constructor';
import { isAnyEmpty, isArray, isBlank, isObject } from '@gradii/check-type';
import {uniq} from 'ramda';


export function mixinHasEvents<T extends Constructor<any>>(base: T) {
  // @ts-ignore
  return class _Self extends base {
    /*The event map for the model.

    Allows for object-based events for native Eloquent events.*/
    _dispatchesEvents: any[] = [];
    /*User exposed observable events.

    These are extra user-defined events observers may subscribe to.*/
    _observables: any[] = [];

    /*Register observers with the model.*/
    public static observe(classes: object | any[] | string) {
      // const instance = new this();
      // for (let clazz of Arr.wrap(classes)) {
      //   instance.registerObserver(clazz);
      // }
    }

    /*Register a retrieved model event with the dispatcher.*/
    public static retrieved(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('retrieved', callback);
    }

    /*Register a saving model event with the dispatcher.*/
    public static saving(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('saving', callback);
    }

    /*Register a saved model event with the dispatcher.*/
    public static saved(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('saved', callback);
    }

    /*Register an updating model event with the dispatcher.*/
    public static updating(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('updating', callback);
    }

    /*Register an updated model event with the dispatcher.*/
    public static updated(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('updated', callback);
    }

    /*Register a creating model event with the dispatcher.*/
    public static creating(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('creating', callback);
    }

    /*Register a created model event with the dispatcher.*/
    public static created(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('created', callback);
    }

    /*Register a replicating model event with the dispatcher.*/
    public static replicating(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('replicating', callback);
    }

    /*Register a deleting model event with the dispatcher.*/
    public static deleting(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('deleting', callback);
    }

    /*Register a deleted model event with the dispatcher.*/
    public static deleted(callback: Function | string) {
      (/*static*/ this)._registerModelEvent('deleted', callback);
    }

    /*Remove all of the event listeners for the model.*/
    public static flushEventListeners() {
      if (!((/*static*/ this).dispatcher !== undefined)) {
        return;
      }
      const instance = new this();
      for (const event of instance.getObservableEvents()) {
        (/*static*/ this).dispatcher.forget('"eloquent.{$event}: "' + HasEvents);
      }
      for (const event of array_values(instance._dispatchesEvents)) {
        (/*static*/ this).dispatcher.forget(event);
      }
    }

    /*Get the event dispatcher instance.*/
    public static getEventDispatcher() {
      return (/*static*/ this).dispatcher;
    }

    /*Set the event dispatcher instance.*/
    public static setEventDispatcher(dispatcher: Dispatcher) {
      (/*static*/ this).dispatcher = dispatcher;
    }

    /*Unset the event dispatcher for models.*/
    public static unsetEventDispatcher() {
      (/*static*/ this).dispatcher = null;
    }

    /*Execute a callback without firing any model events for any model type.*/
    public static withoutEvents(callback: Function) {
      const dispatcher = (/*static*/ this).getEventDispatcher();
      if (dispatcher) {
        (/*static*/ this).setEventDispatcher(new NullDispatcher(dispatcher));
      }
      try {
        return callback();
      } finally {
        if (dispatcher) {
          (/*static*/ this).setEventDispatcher(dispatcher);
        }
      }
    }

    /*Register a model event with the dispatcher.*/
    static _registerModelEvent(event: string, callback: Function | string) {
      if ((/*static*/<any>this).dispatcher !== undefined) {
        const name = this.prototype.constructor.name;
        (/*static*/<any>this).dispatcher.listen(`eloquent.${event}: ${name}`, callback);
      }
    }

    /*Get the observable event names.*/
    public getObservableEvents() {
      return [
        ...[
          'retrieved', 'creating', 'created', 'updating', 'updated', 'saving', 'saved',
          'restoring', 'restored', 'replicating', 'deleting', 'deleted', 'forceDeleted'
        ],
        ...this._observables
      ];
    }

    /*Set the observable event names.*/
    public setObservableEvents(observables: any[]) {
      this._observables = observables;
      return this;
    }

    /*Add an observable event name.*/
    public addObservableEvents(observables: any[] | any) {
      this._observables = uniq([
        ...this._observables,
        ...(isArray(observables) ? observables : arguments)
      ]);
    }

    /*Remove an observable event name.*/
    public removeObservableEvents(observables: any[] | any) {
      this._observables = array_diff(this._observables, isArray(observables) ? observables : func_get_args());
    }

    /*Register a single observer with the model.*/
    protected registerObserver(clazz: object | string) {
      const className = this.resolveObserverClassName(clazz);
      for (let event of this.getObservableEvents()) {
        if (method_exists(clazz, event)) {
          (/*static*/<any>this.constructor).registerModelEvent(event, className + '@' + event);
        }
      }
    }

    /*Fire the given event for the model.*/
    protected fireModelEvent(event: string, halt: boolean = true) {
      if (!((/*static*/<any>this.constructor).dispatcher !== undefined)) {
        return true;
      }
      const method = halt ? 'until' : 'dispatch';
      const result = this.filterModelEventResults(this.fireCustomModelEvent(event, method));
      if (result === false) {
        return false;
      }
      return !isAnyEmpty(result) ? result : (/*static*/<any>this.constructor).dispatcher[method]('"eloquent.{$event}: "' + HasEvents,
        this);
    }

    /*Fire a custom model event for the given event.*/
    protected fireCustomModelEvent(event: string, method: string) {
      if (!(this._dispatchesEvents[event] !== undefined)) {
        return;
      }
      const result = (/*static*/<any>this.constructor).dispatcher.method(new this._dispatchesEvents[event](this));
      if (!isBlank(result)) {
        return result;
      }
    }

    /*Filter the model event results.*/
    protected filterModelEventResults(result: any) {
      if (isArray(result)) {
        result = result.filter(response => !!response);
      }
      return result;
    }

    /*Resolve the observer's class name from an object or string.*/
    private resolveObserverClassName(clazz: object | string) {
      if (isObject(clazz)) {
        return clazz.constructor;
      }
      // return clazz;
      // if (class_exists(clazz)) {
      //   return clazz;
      // }
      throw new Error(`InvalidArgumentException Unable to find observer: ${clazz}`);
    }
  };
}



