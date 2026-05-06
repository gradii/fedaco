/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Column } from '@gradii/fedaco';
import { HasManyColumn } from '@gradii/fedaco';
import { Table } from '@gradii/fedaco';
import { Model } from '@gradii/fedaco';

@Table({
  tableName: 'article_model',
})
export class ArticleModel extends Model {}

@Table({
  tableName: 'member_model',
})
export class MemberModel extends Model {
  @Column()
  id: number;

  @HasManyColumn({
    related: ArticleModel,
  })
  articles: Promise<any>;
}

@Table({
  tableName: 'has_many_relation_model',
})
export class HasManyRelationModel extends Model {
  @HasManyColumn({
    related: ArticleModel,
  })
  columnFoo: any;
}
