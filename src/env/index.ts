import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.string().default('3333'),
  TOPIC: z.string(),
  MQTT_CONNECT: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const err = z.treeifyError(_env.error).properties;
  console.error('Invalid environment variables!', err);
  throw new Error('Invalid enviroment variables!');
}

export const env = _env.data;
