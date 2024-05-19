# Function setRawAttributes
### timestamps using custom date format

```typescript
const model = new FedacoTestUser();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.SSSS');
model.setRawAttributes({
  created_at: '2017-11-14 08:23:19.0000',
  updated_at: '2017-11-14 08:23:19.7348'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.fromDateTime(model.getAttribute('updated_at'))` | exactly match | `'2017-11-14 08:23:19.734800'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### timestamps using default sql server date format

```typescript
const model = new FedacoTestUser();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.SSS');
model.setRawAttributes({
  created_at: '2017-11-14 08:23:19.000',
  updated_at: '2017-11-14 08:23:19.734'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.fromDateTime(model.getAttribute('updated_at'))` | exactly match | `'2017-11-14 08:23:19.734'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### timestamps using old sql server date format

```typescript
const model = new FedacoTestUser();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.000');
model.setRawAttributes({
  created_at: '2017-11-14 08:23:19.000'
});
```


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

### to array includes custom formatted timestamps

```typescript
const model = new FedacoTestUserWithCustomDateSerialization();
model.setRawAttributes({
  created_at: '2012-12-04',
  updated_at: '2012-12-05'
});
const array = model.toArray();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `array['updated_at']` | exactly match | `'05-12-12'` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
