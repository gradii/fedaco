import { Column } from '../../src/annotation/column';
import { Model } from '../../src/fedaco/model';


export class StubModel extends Model {
  constructor() {
    super();
  }

  @Column({
    name: 'name'
  })
  name;

}