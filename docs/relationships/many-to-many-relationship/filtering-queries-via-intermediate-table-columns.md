# Filtering Queries via Intermediate Table Columns

You can also filter the results returned by `BelongsToManyColumn` relationship queries using the `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull`, and `wherePivotNotNull` methods when defining the relationship:

```typescript
@Table({
  tableName: 'users'
})
class User extends Model {
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    onQuery: (q => {
      q.wherePivot('approved', 1);
    })
  })
  role
}
```

```typescript
@Table({
  tableName: 'users'
})
class User extends Model {
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    onQuery: (q => {
      q.wherePivotIn('priority', [1, 2]);
    })
  })
  role
}
```

```typescript
@Table({
  tableName: 'users'
})
class User extends Model {
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    onQuery: (q => {
      q.wherePivotNotIn('priority', [1, 2]);
    })
  })
  role
}
```

```typescript
@Table({
  tableName: 'users'
})
class User extends Model {
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    onQuery: (q => {
      q.as('subscriptions').wherePivotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);
    })
  })
  role
}
```

```typescript
@Table({
  tableName: 'users'
})
class User extends Model {
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    onQuery: (q => {
      q.as('subscriptions').wherePivotNotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00'])
    })
  })
  role
}
```

```typescript
@Table({
  tableName: 'users'
})
class User extends Model {
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    onQuery: (q => {
      q.as('subscriptions').wherePivotNull('expired_at');
    })
  })
  role
}
```

```typescript
@Table({
  tableName: 'users'
})
class User extends Model {
  @BelongsToManyColumn({
    related: forwardRef(() => Role),
    onQuery: (q => {
      q.as('subscriptions').wherePivotNotNull('expired_at');
    })
  })
  role
}
```