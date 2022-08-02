/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import type { Model } from './model';

export class FedacoEventManage {
  _registerModelEvent(model: Model, event: string, callback: Function | string) {
    // if ((/*static*/<any>this).dispatcher !== undefined) {
    //   const name = this.prototype.constructor.name;
    //   (/*static*/<any>this).dispatcher.listen(`fedaco.${event}: ${name}`, callback);
    // }
  }


}
