/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export const enum RelationType {
  HasOne = 'HasOne',
  HasOneThrough = 'HasOneThrough',
  HasMany = 'HasMany',
  HasManyThrough = 'HasManyThrough',
  BelongsTo = 'BelongsTo',
  BelongsToMany = 'BelongsToMany',
  MorphOne = 'MorphOne',
  MorphTo = 'MorphTo',
  MorphMany = 'MorphMany',
  MorphToMany = 'MorphToMany',
  MorphedByMany = 'MorphedByMany',
}
