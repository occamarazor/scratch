import { AppConfigDefaults } from './config.constants';
import type { AppConfig, NodeEnv } from './config.types';

const configuration = (): AppConfig => ({
  appName: process.env.APP_NAME ?? AppConfigDefaults.appName,
  nodeEnv: (process.env.NODE_ENV as NodeEnv) ?? AppConfigDefaults.nodeEnv,
  port: Number(process.env.PORT ?? AppConfigDefaults.port),
  frontendUrl: process.env.FRONTEND_URL ?? AppConfigDefaults.frontendUrl,

  database: {
    host: process.env.DATABASE_HOST ?? AppConfigDefaults.database.host,
    port: Number(process.env.DATABASE_PORT ?? AppConfigDefaults.database.port),
    name: process.env.DATABASE_NAME ?? AppConfigDefaults.database.name,
    user: process.env.DATABASE_USER ?? AppConfigDefaults.database.user,
    password: process.env.DATABASE_PASSWORD ?? AppConfigDefaults.database.password,
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET ?? AppConfigDefaults.auth.jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? AppConfigDefaults.auth.jwtExpiresIn,
  },
});

export default configuration;
