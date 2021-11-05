/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Constructor } from '../../helper/constructor';
export declare class NullDispatcher {
    dispatcher: Dispatcher;
    constructor(dispatcher: Dispatcher);
    forget(event: string): void;
    until(): boolean;
    dispatch(): void;
}
export interface Dispatcher {
    forget(event: string): void;
    until(): boolean;
    dispatch(evt: any): void;
}
export interface HasEvents {
}
export declare function mixinHasEvents<T extends Constructor<any>>(base: T): {
    new (...args: any[]): {
        [x: string]: any;
        _dispatchesEvents: any;
        _observables: any[];
        getObservableEvents(): any[];
        setObservableEvents(observables: any[]): any;
        addObservableEvents(observables: any[] | any): void;
        removeObservableEvents(observables: any[] | any): void;
        _registerObserver(clazz: any & T): void;
        _fireModelEvent(event: string, halt?: boolean): any;
        _fireCustomModelEvent(event: string, method: string): any;
        _filterModelEventResults(result: any): any;
        _resolveObserverClassName(clazz: object | string): Function;
    };
    dispatcher: Dispatcher;
    observe(classes: object | any[] | string): void;
    retrieved(callback: Function | string): void;
    saving(callback: Function | string): void;
    saved(callback: Function | string): void;
    updating(callback: Function | string): void;
    updated(callback: Function | string): void;
    creating(callback: Function | string): void;
    created(callback: Function | string): void;
    replicating(callback: Function | string): void;
    deleting(callback: Function | string): void;
    deleted(callback: Function | string): void;
    flushEventListeners(): void;
    getEventDispatcher(): Dispatcher;
    setEventDispatcher(dispatcher: Dispatcher): void;
    unsetEventDispatcher(): void;
    withoutEvents(callback: Function): any;
    _registerModelEvent(event: string, callback: Function | string): void;
} & T;
