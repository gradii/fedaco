/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { FedacoBuilder } from '../fedaco-builder';
import type { Model } from '../model';
import { Scope } from '../scope';


export function restore() {
  return (builder: FedacoBuilder) => {
    builder.pipe(
      withTrashed()
    );
    return builder.update({
      [builder.getModel().getDeletedAtColumn()]: null
    });
  };
}

export function withTrashed(withTrashed = true) {
  return (builder: FedacoBuilder) => {
    if (!withTrashed) {
      return builder.pipe(
        withoutTrashed()
      );
    }
    return builder.withoutGlobalScope('softDeleting');
  };
}

export function withoutTrashed() {
  return (builder: FedacoBuilder) => {
    const model = builder.getModel();
    builder.withoutGlobalScope('softDeleting')
      .whereNull(model.getQualifiedDeletedAtColumn());
    return builder;
  };
}

export function onlyTrashed() {
  return (builder: FedacoBuilder) => {
    const model = builder.getModel();
    builder.withoutGlobalScope('softDeleting')
      .whereNotNull(model.getQualifiedDeletedAtColumn());
    return builder;
  };
}


// import { Builder } from 'Illuminate/Database/Eloquent/Builder';
// import { Model } from 'Illuminate/Database/Eloquent/Model';
export class SoftDeletingScope extends Scope {
  /*All of the extensions to be added to the builder.*/
  protected extensions: string[] = ['Restore', 'WithTrashed', 'WithoutTrashed', 'OnlyTrashed'];

  /*Apply the scope to a given Eloquent query builder.*/
  public apply(builder: FedacoBuilder, model: Model) {
    builder.whereNull(model.getQualifiedDeletedAtColumn());
  }

  /*Extend the query builder with the needed functions.*/
  public extend(builder: FedacoBuilder) {
    // for (let extension of this.extensions) {
    //   this['"add{$extension}"'](builder);
    // }
    builder.onDelete((builder: FedacoBuilder) => {
      const column = this.getDeletedAtColumn(builder);
      return builder.update({
        [column]: builder.getModel().freshTimestampString()
      });
    });
  }

  /*Get the "deleted at" column for the builder.*/
  protected getDeletedAtColumn(builder: FedacoBuilder) {
    if (builder.getQuery()._joins.length > 0) {
      return builder.getModel().getQualifiedDeletedAtColumn();
    }
    return builder.getModel().getDeletedAtColumn();
  }

  // /*Add the restore extension to the builder.*/
  // protected addRestore(builder: FedacoBuilder) {
  //   builder.macro('restore', (builder: FedacoBuilder) => {
  //     builder.withTrashed();
  //     return builder.update({});
  //   });
  // }
  //
  // /*Add the with-trashed extension to the builder.*/
  // protected addWithTrashed(builder: FedacoBuilder) {
  //   builder.macro('withTrashed', (builder: FedacoBuilder, withTrashed = true) => {
  //     if (!withTrashed) {
  //       return builder.withoutTrashed();
  //     }
  //     return builder.withoutGlobalScope(this);
  //   });
  // }
  //
  // /*Add the without-trashed extension to the builder.*/
  // protected addWithoutTrashed(builder: FedacoBuilder) {
  //   builder.macro('withoutTrashed', (builder: FedacoBuilder) => {
  //     let model = builder.getModel();
  //     builder.withoutGlobalScope(this).whereNull(model.getQualifiedDeletedAtColumn());
  //     return builder;
  //   });
  // }
  //
  // /*Add the only-trashed extension to the builder.*/
  // protected addOnlyTrashed(builder: FedacoBuilder) {
  //   builder.macro('onlyTrashed', (builder: FedacoBuilder) => {
  //     let model = builder.getModel();
  //     builder.withoutGlobalScope(this).whereNotNull(model.getQualifiedDeletedAtColumn());
  //     return builder;
  //   });
  // }
}
