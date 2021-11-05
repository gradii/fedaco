# Function match
### has with non where bindings

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await (
  await user.newRelation('posts').create({
    name: 'Post 2'
  })
)
  .newRelation('photos')
  .create({
    name: 'photo.jpg'
  });
const query = await FedacoTestUser.createQuery().has('postWithPhotos');
const { result: sql, bindings } = query.toSql();
const bindingsCount = bindings.length;
const questionMarksCount = sql.match(/\?/g)?.length || 0;
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
