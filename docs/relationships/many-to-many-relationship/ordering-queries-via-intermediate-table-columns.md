# Ordering Queries via Intermediate Table Columns

You can order the results returned by `belongsToMany` relationship queries using the `orderByPivot` method. In the following example, we will retrieve all of the latest badges for the user:

```typescript
@Table({
  tableName: 'users'
})
class User extends Model {
  @BelongsToManyColumn({
    related: forwardRef(() => Badge),
    onQuery: (q => {
      q.where('rank', 'gold')
        .orderByPivot('created_at', 'desc');
    })
  })
  badge
}
```
