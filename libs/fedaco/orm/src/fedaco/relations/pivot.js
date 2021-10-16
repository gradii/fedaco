import { Model } from '../model'
import { mixinAsPivot } from './concerns/as-pivot'
export class Pivot extends mixinAsPivot(Model) {
  constructor() {
    super(...arguments)

    this.incrementing = false

    this.guarded = []
  }
}
