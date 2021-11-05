# Function Where Has
### where has on nested self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
await friend.newRelation('friends').create({
  email: 'foo@gmail.com'
});
const results: FedacoTestUser[] = await FedacoTestUser.createQuery()
  .whereHas('friends.friends', (query) => {
    query.where('email', 'foo@gmail.com');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### where has on nested self referencing belongs to relationship

```typescript
const grandParentPost = await FedacoTestPost.createQuery().create({
  name: 'Grandparent Post',
  user_id: 1
});
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  parent_id: grandParentPost.id,
  user_id: 2
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 3
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .whereHas('parentPost.parentPost', (query) => {
    query.where('name', 'Grandparent Post');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Child Post'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### where has on nested self referencing has many relationship

```typescript
const grandParentPost = await FedacoTestPost.createQuery().create({
  name: 'Grandparent Post',
  user_id: 1
});
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  parent_id: grandParentPost.id,
  user_id: 2
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 3
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .whereHas('childPosts.childPosts', (query) => {
    query.where('name', 'Child Post');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Grandparent Post'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### where has on self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
const results: FedacoTestUser[] = await FedacoTestUser.createQuery()
  .whereHas('friends', (query) => {
    query.where('email', 'xsilen@gradii.com');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### where has on self referencing belongs to relationship

```typescript
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  user_id: 1
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 2
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .whereHas('parentPost', (query) => {
    query.where('name', 'Parent Post');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Child Post'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### where has on self referencing has many relationship

```typescript
const parentPost = await FedacoTestPost.createQuery().create({
  name: 'Parent Post',
  user_id: 1
});
await FedacoTestPost.createQuery().create({
  name: 'Child Post',
  parent_id: parentPost.id,
  user_id: 2
});
const results: FedacoTestPost[] = await FedacoTestPost.createQuery()
  .whereHas('childPosts', (query) => {
    query.where('name', 'Child Post');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).name` | exactly match | `'Parent Post'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
