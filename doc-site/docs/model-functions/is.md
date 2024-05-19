# Function is
### is after retrieving the same model

```typescript
const saved = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
const retrieved = await FedacoTestUser.createQuery().find(1);
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
