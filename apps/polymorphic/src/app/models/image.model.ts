import { Column, forwardRef, MorphToColumn, PrimaryGeneratedColumn, Table } from '@gradii/fedaco';
import { Post } from './post.model';


@Table({
  tableName: 'images'
})
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @MorphToColumn({
    morphTypeMap: {
      'posts': forwardRef(() => Post)
    }
  })
  imageable;

}
