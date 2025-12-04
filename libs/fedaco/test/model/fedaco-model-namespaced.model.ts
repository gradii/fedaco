/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Table } from '../../src/annotation/table/table';
import { Model } from '../../src/fedaco/model';

@Table({
  tableName: 'fedaco_model_namespaced_models',
})
export class FedacoModelNamespacedModel extends Model {}
