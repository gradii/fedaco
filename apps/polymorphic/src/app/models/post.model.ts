import {
  Column,
  CreatedAtColumn, FedacoRelationType,
  forwardRef, Model,
  MorphOneColumn,
  PrimaryGeneratedColumn,
  Table,
  UpdatedAtColumn
} from '@gradii/fedaco';
import { Image } from './image.model';

@Table({
  tableName: 'posts',
  morphTypeName: 'test_post'
})
export class Post extends Model {
  _fillable = ['name'];

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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
