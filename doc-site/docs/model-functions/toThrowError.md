# Function toThrowError
### find or fail with multiple ids throws model not found exception

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await expect(async () => {
  await FedacoTestUser.createQuery().findOrFail([1, 2]);
}).rejects.toThrowError(
  'ModelNotFoundException No query results for model [FedacoTestUser] [1,2]'
);
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### find or fail with single id throws model not found exception

```typescript
await expect(async () => {
  await FedacoTestUser.createQuery().findOrFail(1);
}).rejects.toThrowError(
  'ModelNotFoundException No query results for model [FedacoTestUser] 1'
);
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### has on morph to relationship

```typescript
await expect(async () => {
  await FedacoTestUser.createQuery().has('imageable').get();
}).rejects.toThrowError(
  `the relation [imageable] can't acquired. try to define a relation like\n@HasManyColumn()\npublic readonly imageable;\n`
);
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

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
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
