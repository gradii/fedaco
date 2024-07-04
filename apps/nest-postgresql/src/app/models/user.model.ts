import { Column, CreatedAtColumn, Model, PrimaryGeneratedColumn, Table, UpdatedAtColumn } from '@gradii/fedaco';


@Table({
  tableName : 'users',
  connection: 'default',
})
export class UserModel extends Model {
  _fillable = ['username']
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  declare username: string;

  @CreatedAtColumn()
  created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;
}