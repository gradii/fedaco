import {
  Column,
  CreatedAtColumn,
  forwardRef,
  MorphOneColumn,
  PrimaryGeneratedColumn,
  Table,
  UpdatedAtColumn
} from '@gradii/fedaco';
import { Image } from './image.model';

@Table({
  tableName: 'posts'
})
export class Post {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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
