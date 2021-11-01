## morph map is merged by default

```typescript
const map1 = {
      'user': FedacoTestUser
    };
const map2 = {
      'post': FedacoTestPost
    };
Relation.morphMap(map1);
Relation.morphMap(map2);
```