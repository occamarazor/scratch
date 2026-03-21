import * as Joi from 'joi';

import {
  AppConfigDefaults,
  NODE_ENV_DEVELOPMENT,
  NODE_ENV_PRODUCTION,
  NODE_ENV_TEST,
} from './config.constants';
import configuration from './config.factory';
import type { AppConfig } from './config.types';

const cfg: AppConfig = configuration();

const baseSchema = Joi.object({
  APP_NAME: Joi.string().default(AppConfigDefaults.appName),
  NODE_ENV: Joi.string()
    .valid(NODE_ENV_DEVELOPMENT, NODE_ENV_TEST, NODE_ENV_PRODUCTION)
    .default(AppConfigDefaults.nodeEnv),
  PORT: Joi.number().default(AppConfigDefaults.port),
  FRONTEND_URL: Joi.string().uri().allow('').optional(), // TODO: allow bootstrapping without in early dev

  DATABASE_HOST: Joi.string().default(AppConfigDefaults.database.host),
  DATABASE_PORT: Joi.number().default(AppConfigDefaults.database.port),
  DATABASE_NAME: Joi.string().default(AppConfigDefaults.database.name),
  DATABASE_USER: Joi.string().default(AppConfigDefaults.database.user),
  DATABASE_PASSWORD: Joi.string().default(AppConfigDefaults.database.password),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default(AppConfigDefaults.auth.jwtExpiresIn),
});

export default cfg.nodeEnv === NODE_ENV_PRODUCTION
  ? baseSchema.fork(['JWT_SECRET', 'FRONTEND_URL'], (s) => s.required())
  : baseSchema;
