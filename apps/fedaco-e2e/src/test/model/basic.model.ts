/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Column } from '@gradii/fedaco';
import { Model } from '@gradii/fedaco';

export class BasicModel extends Model {
  @Column({
    field: 'name',
  })
  name = '132';

  @Column()
  score: string;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date;

  constructor() {
    super();
  }
}
