import { Column, CreatedAtColumn, Model, PrimaryGeneratedColumn, Table, UpdatedAtColumn } from '../../src';

@Table({
  tableName : 'users',
  connection: 'default',
})
export class PostgresqlUserModel extends Model {
  _fillable = ['username'];
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  declare username: string;

  @CreatedAtColumn()
  created_at: Date;

  @UpdatedAtColumn()
  updated_at: Date;
}
