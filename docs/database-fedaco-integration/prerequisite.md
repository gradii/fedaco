# Prerequisites
### Define For Fedaco Test User

```typescript
@Table({
    morphTypeName: 'user'
})
export class FedacoTestUser extends Model {
    _table: any = 'users';
    _dates: any = ['birthday'];
    _guarded: any = [];
    @PrimaryColumn()
    id;
    @Column()
    name;
    @Column()
    email;
    @CreatedAtColumn()
    created_at;
    @UpdatedAtColumn()
    updated_at;
    @BelongsToManyColumn({
        related: FedacoTestUser,
        table: 'friends',
        foreignPivotKey: 'user_id',
        relatedPivotKey: 'friend_id'
    })
    friends;
    @BelongsToManyColumn({
        related: FedacoTestUser,
        table: 'friends',
        foreignPivotKey: 'user_id',
        relatedPivotKey: 'friend_id',
        onQuery: (q: BelongsToMany) => {
            q.wherePivot('user_id', 1);
        }
    })
    friendsOne;
    @BelongsToManyColumn({
        related: FedacoTestUser,
        table: 'friends',
        foreignPivotKey: 'user_id',
        relatedPivotKey: 'friend_id',
        onQuery: (q: BelongsToMany) => {
            q.wherePivot('user_id', 2);
        }
    })
    friendsTwo;
    @HasManyColumn({
        related: forwardRef(() => FedacoTestPost),
        foreignKey: 'user_id',
    })
    public posts: Promise<any[]>;
    @HasOneColumn({
        related: forwardRef(() => FedacoTestPost),
        foreignKey: 'user_id',
    })
    public post;
    @MorphManyColumn({
        related: forwardRef(() => FedacoTestPhoto),
        morphName: 'imageable',
    })
    public photos;
    @HasOneColumn({
        related: forwardRef(() => FedacoTestPost),
        foreignKey: 'user_id',
        onQuery: (q => {
            q.join('photo', join => {
                join.on('photo.imageable_id', 'post.id');
                join.where('photo.imageable_type', 'FedacoTestPost');
            });
        })
    })
    public postWithPhotos;
}
```
### Define For Fedaco Test User With Custom Friend Pivot

```typescript
export class FedacoTestUserWithCustomFriendPivot extends FedacoTestUser {
    @BelongsToManyColumn({
        related: FedacoTestUser,
        table: 'friends',
        foreignPivotKey: 'user_id',
        relatedPivotKey: 'friend_id',
        onQuery: (q: BelongsToMany) => {
            q.using(FedacoTestFriendPivot).withPivot('user_id', 'friend_id', 'friend_level_id');
        }
    })
    friends;
}
```
### Define For Fedaco Test User With Space In Column Name

```typescript
export class FedacoTestUserWithSpaceInColumnName extends FedacoTestUser {
    _table: any = 'users_with_space_in_colum_name';
}
```
### Define For Fedaco Test Non Incrementing

```typescript
export class FedacoTestNonIncrementing extends Model {
    _table: any = 'non_incrementing_users';
    _guarded: any = [];
    public _incrementing: any = false;
    public _timestamps: any = false;
}
```
### Define For Fedaco Test Non Incrementing Second

```typescript
export class FedacoTestNonIncrementingSecond extends FedacoTestNonIncrementing {
    _connection: any = 'second_connection';
    @Column()
    name;
}
```
### Define For Fedaco Test User With Global Scope

```typescript
export class FedacoTestUserWithGlobalScope extends FedacoTestUser {
    public boot() {
        super.boot();
        FedacoTestUserWithGlobalScope.addGlobalScope('withPosts', builder => {
            builder.with('posts');
        });
    }
}
```
### Define For Fedaco Test User With Omitting Global Scope

```typescript
export class FedacoTestUserWithOmittingGlobalScope extends FedacoTestUser {
    public boot() {
        super.boot();
        FedacoTestUserWithOmittingGlobalScope.addGlobalScope('notEmail', builder => {
            builder.where('email', '!=', 'linbolen@gradii.com');
        });
    }
}
```
### Define For Fedaco Test Post

```typescript
@Table({
    morphTypeName: 'post',
})
export class FedacoTestPost extends Model {
    _table: any = 'posts';
    _guarded: any = [];
    @PrimaryColumn()
    id;
    @Column()
    name;
    @BelongsToColumn({
        related: FedacoTestUser,
        foreignKey: 'user_id'
    })
    public user;
    @MorphManyColumn({
        related: forwardRef(() => FedacoTestPhoto),
        morphName: 'imageable',
    })
    photos;
    @HasManyColumn({
        related: forwardRef(() => FedacoTestPost),
        foreignKey: 'parent_id',
    })
    childPosts: Promise<any[]>;
    @BelongsToColumn({
        related: forwardRef(() => FedacoTestPost),
        foreignKey: 'parent_id',
    })
    parentPost;
}
```
### Define For Fedaco Test Friend Level

```typescript
export class FedacoTestFriendLevel extends Model {
    _table: any = 'friend_levels';
    _guarded: any = [];
    @Column()
    level;
}
```
### Define For Fedaco Test Photo

```typescript
@Table({})
export class FedacoTestPhoto extends Model {
    _table: any = 'photos';
    _guarded: any = [];
    @Column()
    name;
    @MorphToColumn({
        morphTypeMap: {
            'FedacoTestUser': FedacoTestUser,
            'FedacoTestPost': FedacoTestPost,
            'user': FedacoTestUser,
            'post': FedacoTestPost,
        }
    })
    public imageable;
}
```
### Define For Fedaco Test User With String Cast Id

```typescript
export class FedacoTestUserWithStringCastId extends FedacoTestUser {
    @Column()
    id: string;
}
```
### Define For Fedaco Test User With Custom Date Serialization

```typescript
export class FedacoTestUserWithCustomDateSerialization extends FedacoTestUser {
    serializeDate(date) {
        return format(date, 'dd-MM-yy');
    }
}
```
### Define For Fedaco Test Order

```typescript
export class FedacoTestOrder extends Model {
    _table: any = 'test_orders';
    _guarded: any = [];
    _with: any[] = ['item'];
    @PrimaryColumn()
    id;
    @MorphToColumn({
        morphTypeMap: {
            FedacoTestItem: forwardRef(() => FedacoTestItem)
        }
    })
    public item;
}
```
### Define For Fedaco Test Item

```typescript
export class FedacoTestItem extends Model {
    _table: any = 'test_items';
    _guarded: any = [];
    _connection: any = 'second_connection';
}
```
### Define For Fedaco Test With Json

```typescript
export class FedacoTestWithJSON extends Model {
    _table: any = 'with_json';
    _guarded: any = [];
    public _timestamps: any = false;
    @ArrayColumn()
    json;
}
```
### Define For Fedaco Test Friend Pivot

```typescript
export class FedacoTestFriendPivot extends Pivot {
    _table: any = 'friends';
    _guarded: any = [];
    @BelongsToColumn({
        related: FedacoTestUser
    })
    public user;
    @BelongsToColumn({
        related: FedacoTestUser
    })
    public friend;
    @BelongsToColumn({
        related: FedacoTestFriendLevel,
        foreignKey: 'friend_level_id'
    })
    public level;
}
```