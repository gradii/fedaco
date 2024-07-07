import {
  Column,
  CreatedAtColumn,
  forwardRef,
  Model,
  MorphOneColumn,
  PrimaryGeneratedColumn,
  Table, UpdatedAtColumn
} from '@gradii/fedaco';
import { Image } from './image.model';

@Table({
  tableName: 'users'
})
export class User extends Model {
  _fillable = ['name', 'email'];

  @PrimaryGeneratedColumn()
  id;

  @Column()
  name: string;

  @Column()
  email: string;

  @MorphOneColumn({
    related: forwardRef(() => Image),
    morphName: 'imageable'
  })
  public image;

  @CreatedAtColumn()
  created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;
}
