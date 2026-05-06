import 'reflect-metadata';

import { CommandFactory } from 'nest-commander';

import { AppModule } from './app/app.module';
import { loadFedacoConfig } from './app/config/load-config';

async function bootstrap() {
  const config = await loadFedacoConfig();

  await CommandFactory.run(AppModule.forRoot(config), {
    logger: ['error', 'warn'],
    cliName: 'fedaco',
  });
}

bootstrap().catch((err) => {
  process.stderr.write(
    err instanceof Error ? `${err.stack ?? err.message}\n` : `${String(err)}\n`
  );
  process.exit(1);
});
