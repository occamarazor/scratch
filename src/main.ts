import configuration from '@config/config.factory';
import type { AppConfig } from '@config/config.types';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
  const app: INestApplication = await NestFactory.create(AppModule);
  const cfg: AppConfig = configuration();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error on extra props
      transform: true, // converts types automatically
    }),
  );
  await app.listen(cfg.port);
};

bootstrap().catch((error) => console.error(error));
