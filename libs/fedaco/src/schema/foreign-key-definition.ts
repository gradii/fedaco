/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { wrap } from '../helper/arr';
import type { ColumnDefineAttributes} from './column-definition';
import { ColumnDefinition } from './column-definition';


export type ForeignKeyDefinitionAttributes = {
  deferrable: boolean;
  initiallyImmediate: boolean;
  on: string;
  onDelete: string;
  onUpdate: string;
  references: string | string[];
};

export class ForeignKeyDefinition extends ColumnDefinition {
  public declare attributes: ColumnDefineAttributes & ForeignKeyDefinitionAttributes;


  public get deferrable() {
    return this.get('deferrable');
  }

  public get initiallyImmediate() {
    return this.get('initiallyImmediate');
  }

  public get on() {
    return this.get('on');
  }

  public get onDelete() {
    return this.get('onDelete');
  }

  public get onUpdate() {
    return this.get('onUpdate');
  }

  public get references() {
    return this.get('references');
  }

  /**
   * Set the foreign key as deferrable (PostgreSQL)
   */
  withDeferrable(value: boolean = true) {
    this.attributes['deferrable'] = value;
    return this;
  }

  /**
   * Set the default time to check the constraint (PostgreSQL)
   */
  withInitiallyImmediate(value: boolean = true) {
    this.attributes['initiallyImmediate'] = value;
    return this;
  }

  /**
   * Specify the referenced table
   */
  withOn(table: string) {
    this.attributes['on'] = table;
    return this;
  }

  /**
   * Add an ON DELETE action
   */
  withOnDelete(action: string) {
    this.attributes['onDelete'] = action;
    return this;
  }

  /**
   * Add an ON UPDATE action
   */
  withOnUpdate(action: string) {
    this.attributes['onUpdate'] = action;
    return this;
  }

  /**
   * Specify the referenced column(s)
   */
  withReferences(columns: string | string[]) {
    this.attributes['references'] = wrap(columns);
    return this;
  }

  /*Indicate that updates should cascade.*/
  public withCascadeOnUpdate() {
    return this.withOnUpdate('cascade');
  }

  /*Indicate that deletes should cascade.*/
  public withCascadeOnDelete() {
    return this.withOnDelete('cascade');
  }

  /*Indicate that deletes should be restricted.*/
  public withRestrictOnDelete() {
    return this.withOnDelete('restrict');
  }

  /*Indicate that deletes should set the foreign key value to null.*/
  public withNullOnDelete() {
    return this.withOnDelete('set null');
  }
}
