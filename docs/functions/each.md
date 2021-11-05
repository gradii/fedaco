# Function Each
### belongs to many relationship models are properly hydrated over each request

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
await (
  await FedacoTestUser.createQuery().first()
)
  .newRelation('friends')
  .each()
  .pipe(
    tap(({ item: result, index }) => {
      expect(result.email).toBe('xsilen@gradii.com');
      expect(result.getAttribute('user_id')).toBe(user.id);
      expect(result.getAttribute('friend_id')).toBe(friend.id);
    })
  )
  .toPromise();
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
