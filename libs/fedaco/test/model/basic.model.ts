/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Column } from '../../src/annotation/column/column';
import { Model } from '../../src/fedaco/model';

export class BasicModel extends Model {

  @Column({
    field: 'name'
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

