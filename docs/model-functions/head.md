# Function Head
### belongs to many relationship models are properly hydrated over chunked request

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.NewRelation('friends').create({
  email: 'xsilen@gradii.com'
});
const user1: FedacoTestUser = await FedacoTestUser.createQuery().first();
await user1
  .NewRelation('friends')
  .chunk(2)
  .pipe(
    tap(({ results: friends }) => {
      expect(friends.length).toBe(1);
      expect(head(friends).email).toBe('xsilen@gradii.com');
      expect(head(friends).getRelation('pivot').getAttribute('user_id')).toBe(
        user.id
      );
      expect(head(friends).getRelation('pivot').getAttribute('friend_id')).toBe(
        friend.id
      );
    })
  )
  .toPromise();
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
