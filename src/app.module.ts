import { Nullable } from '@common/types';
import { NODE_ENV_DEVELOPMENT, NODE_ENV_TEST } from '@config/config.constants';
import configuration from '@config/config.factory';
import type { AppConfig, DatabaseConfig } from '@config/config.types';
import { NodeEnv } from '@config/config.types';
import validationSchema from '@config/config.validation';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TasksModule } from '@tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot<AppConfig>({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      cache: true,
      envFilePath: ['.env.dev', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService<AppConfig>): TypeOrmModuleOptions => {
        const db: Nullable<DatabaseConfig> = cfg.get('database', { infer: true });

        if (!db) throw new Error('Database configuration not found');

        const nodeEnv: Nullable<NodeEnv> = cfg.get('nodeEnv', { infer: true });
        const isDev: boolean = nodeEnv === NODE_ENV_DEVELOPMENT;
        const isTest = nodeEnv === NODE_ENV_TEST;

        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          // Do NOT use synchronize in prod; for dev set via env
          synchronize: false,
          logging: isDev
            ? ['error', 'warn', 'query']
            : isTest
              ? ['error'] // minimal logging in CI
              : ['error'],
        } as TypeOrmModuleOptions;
      },
    }),
    TasksModule,
  ],
})
export class AppModule {}
