import type { AppConfig, DatabaseConfig } from '@config/config.types';
import configuration from '@config/configuration';
import validationSchema from '@config/validation';
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
        const db = cfg.get<DatabaseConfig>('database', { infer: true }) as DatabaseConfig;

        if (!db) throw new Error('Database configuration not found');

        const nodeEnv = cfg.get<AppConfig['nodeEnv']>('nodeEnv', { infer: true }) ?? 'development';
        const isDev = nodeEnv === 'development';

        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: isDev, // only in dev
          logging: isDev ? ['error', 'warn', 'query'] : ['error'],
        } as TypeOrmModuleOptions;
      },
    }),
    TasksModule,
  ],
})
export class AppModule {}
