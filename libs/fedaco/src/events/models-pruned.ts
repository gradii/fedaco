/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export class ModelsPruned {
  /* The class name of the model that was pruned. */
  public model: string;
  /* The number of pruned records. */
  public count: number;

  /* Create a new event instance. */
  public constructor(model: string, count: number) {
    this.model = model;
    this.count = count;
  }
}
