import 'reflect-metadata';

try {
  require('dotenv').config({ quiet: true, override: true });
} catch {
  // dotenv is optional; ignore if not present
}

import { CommandFactory } from 'nest-commander';

import { AppModule } from './app/app.module';
import { loadFedacoConfig } from './app/config/load-config';

async function bootstrap() {
  const config = loadFedacoConfig();

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
