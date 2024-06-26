# Function SaveOrFail
### save or fail with duplicated entry

```typescript
const date = '1970-01-01';
await FedacoTestPost.createQuery().create({
  id: 1,
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date
});
const post = FedacoTestPost.initAttributes({
  id: 1,
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date
});
await expect(async () => {
  await post.saveOrFail();
}).rejects.toThrowError('SQLSTATE[23000]:');
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### save or fail

```typescript
const date = '1970-01-01';
const post = FedacoTestPost.initAttributes({
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestPost.createQuery().count()` | match | `1` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
