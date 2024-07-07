import { Column, forwardRef, Model, MorphToColumn, PrimaryGeneratedColumn, Table } from '@gradii/fedaco';
import { Post } from './post.model';
import { User } from './user.model';


@Table({
  tableName: 'images'
})
export class Image extends Model {
  _fillable = ['url'];

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @MorphToColumn({
    morphTypeMap: {
      'Post': forwardRef(() => Post),
      'User': forwardRef(() => User),
    }
  })
  imageable: any;

}
