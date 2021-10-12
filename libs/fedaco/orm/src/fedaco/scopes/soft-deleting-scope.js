import { Scope } from '../scope';

export function restore() {
  return (builder) => {
    builder.pipe(withTrashed());
    return builder.update({});
  };
}

export function withTrashed(withTrashed = true) {
  return (builder) => {
    if (!withTrashed) {
      return builder.pipe(withoutTrashed());
    }
    return builder.withoutGlobalScope('softDeleting');
  };
}

export function withoutTrashed() {
  return (builder) => {
    const model = builder.getModel();
    builder.withoutGlobalScope('softDeleting')
      .whereNull(model.getQualifiedDeletedAtColumn());
    return builder;
  };
}

export function onlyTrashed() {
  return (builder) => {
    const model = builder.getModel();
    builder.withoutGlobalScope('softDeleting')
      .whereNotNull(model.getQualifiedDeletedAtColumn());
    return builder;
  };
}


export class SoftDeletingScope extends Scope {
  constructor() {
    super(...arguments);

    this.extensions = ['Restore', 'WithTrashed', 'WithoutTrashed', 'OnlyTrashed'];


  }

  apply(builder, model) {
    builder.whereNull(model.getQualifiedDeletedAtColumn());
  }


  getDeletedAtColumn(builder) {
    if (builder.getQuery()._joins.length > 0) {
      return builder.getModel().getQualifiedDeletedAtColumn();
    }
    return builder.getModel().getDeletedAtColumn();
  }
}
