import { Column, CreatedAtColumn, Model, PrimaryGeneratedColumn, Table, UpdatedAtColumn } from '@gradii/fedaco';


@Table({
  tableName : 'users',
  connection: 'default',
})
export class UserModel extends Model {
  _fillable = ['username']
  @PrimaryGeneratedColumn()
  declare id: string;

  @Column()
  declare username: string;

  @CreatedAtColumn()
  declare created_at: Date;

  @UpdatedAtColumn()
  declare updated_at: Date;
}