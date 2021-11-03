## has on morph to relationship

```typescript
await expect(async () => {
  await FedacoTestUser.createQuery().has('imageable').get();
}).rejects.toThrowError(
  `the relation [imageable] can't acquired. try to define a relation like\n@HasManyColumn()\npublic readonly imageable;\n`
);
```


----
see also [prerequisites](./prerequisite.md)
