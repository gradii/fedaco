/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { Model } from '../model'
import { mixinAsPivot } from './concerns/as-pivot'
export class Pivot extends mixinAsPivot(Model) {
  constructor() {
    super(...arguments)

    this.incrementing = false

    this.guarded = []
  }
}
