import {
  Column,
  CreatedAtColumn,
  FedacoRelationType,
  forwardRef,
  Model,
  MorphOneColumn,
  PrimaryGeneratedColumn,
  Table,
  UpdatedAtColumn
} from '@gradii/fedaco';
import { Image } from './image.model';

@Table({
  tableName: 'users',
  morphTypeName: 'test_user'
})
export class User extends Model {
  _fillable = ['name', 'email'];

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @MorphOneColumn({
    related: forwardRef(() => Image),
    morphName: 'imageable'
  })
  public image: FedacoRelationType<Image>;

  @CreatedAtColumn()
  created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;
}
