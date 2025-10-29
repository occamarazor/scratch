import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from './config/configuration';
import validationSchema from './config/validation';
import { MessagesModule } from './messages/messages.module';

// TODO: type errors
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      cache: true,
      envFilePath: ['.env.dev', '.env'], // prefer committed dev env first
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const db = cfg.get('database'); // Unsafe assignment of an `any` value.eslint@typescript-eslint/no-unsafe-assignment
        const isDev = cfg.get('nodeEnv') === 'development';

        return {
          type: 'postgres',
          // Unsafe assignment of an `any` value.eslint@typescript-eslint/no-unsafe-assignment
          // Unsafe member access to all props (host, port etc) on an `any` value.eslint@typescript-eslint/no-unsafe-member-access
          host: db.host,
          port: db.port,
          database: db.name,
          username: db.user,
          password: db.password,
          autoLoadEntities: true,
          synchronize: isDev, // only true in dev
          logging: isDev ? ['error', 'warn', 'query'] : ['error'],
        } as const;
      },
    }),
    MessagesModule,
  ],
})
export class AppModule {}
