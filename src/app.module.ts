import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import type { AppConfig, DatabaseConfig } from './config/config.types';
import configuration from './config/configuration';
import validationSchema from './config/validation';
import { MessagesModule } from './messages/messages.module';

// TODO: move & type the whole config
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      cache: true,
      envFilePath: ['.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<AppConfig>): TypeOrmModuleOptions => {
        const db = cfg.get<DatabaseConfig>('database', { infer: true }) as DatabaseConfig;
        if (!db) throw new Error('Database configuration not found');
        const nodeEnv = cfg.get<AppConfig['nodeEnv']>('nodeEnv', { infer: true });
        const isDev = nodeEnv === 'development';

        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          database: db.name,
          username: db.user,
          password: db.password,
          autoLoadEntities: true,
          synchronize: isDev,
          logging: isDev ? ['error', 'warn', 'query'] : ['error'],
        } as const;
      },
    }),
    MessagesModule,
  ],
})
export class AppModule {}
