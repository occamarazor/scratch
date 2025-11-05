import * as Joi from 'joi';

const baseSchema = Joi.object({
  APP_NAME: Joi.string().default('Scratch'),
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().allow('').optional(), // Optional for dev only

  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().default('scratch_db'),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),

  JWT_SECRET: Joi.string().allow('').optional(), // Optional for dev only
  JWT_EXPIRES_IN: Joi.string().default('1h'),
});

const validationSchema =
  process.env.NODE_ENV === 'production'
    ? baseSchema.fork(['JWT_SECRET', 'FRONTEND_URL'], (s) => s.required())
    : baseSchema;

export default validationSchema;
