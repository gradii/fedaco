# Function ToSql
### has with non where bindings

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await (
  await user.NewRelation('posts').create({
    name: 'Post 2'
  })
)
  .NewRelation('photos')
  .create({
    name: 'photo.jpg'
  });
const query = await FedacoTestUser.createQuery().has('postWithPhotos');
const { result: sql, bindings } = query.toSql();
const bindingsCount = bindings.length;
const questionMarksCount = sql.match(/\?/g)?.length || 0;
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
