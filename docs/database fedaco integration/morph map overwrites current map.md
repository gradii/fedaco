## morph map overwrites current map

```typescript
const map1 = {
  user: FedacoTestUser
};
const map2 = {
  post: FedacoTestPost
};
Relation.morphMap(map1, false);
```
```typescript
Relation.morphMap(map2, false);
```


----
see also [prerequisites](./prerequisite.md)
