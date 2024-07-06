# nest integration

## install

::: code-group

```sh [npm]
$ npm install @gradii/nest-fedaco
```

```sh [yarn]
$ yarn add @gradii/nest-fedaco
```
:::

## define module

```typescript
import {FedacoModule} from '@gradii/nest-fedaco';
import {Module} from '@nestjs/common';

@Module({
  imports: [
    FedacoModule.forRoot({
      'default': {
        driver: 'sqlite',
        database: './tmp/example-nest-startkit.sqlite'
      }
    })
  ],
  controllers: [
    // ...
  ],
  providers: [],
})
export class AppModule {
}
```