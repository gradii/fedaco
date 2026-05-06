/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Column, Model } from '@gradii/fedaco';

export class StubModel extends Model {
  constructor() {
    super();
  }

  @Column({
    field: 'name',
  })
  name: string;
}
