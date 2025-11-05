import type { AppConfig } from './config.types';

const configuration = (): AppConfig => ({
  appName: process.env.APP_NAME ?? 'Scratch',
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL ?? undefined,
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    name: process.env.DATABASE_NAME ?? 'scratch_db',
    user: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? undefined,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
});

export default configuration;
