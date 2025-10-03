import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { env } from '../env';

export default fp(async (fastify) => {
  const secret = env.SECRET_KEY;

  if (!secret) {
    fastify.log.error('❌ JWT SECRET_KEY não definida no .env');
    throw new Error('SECRET_KEY ausente no .env');
  }

  fastify.register(jwt, {
    secret,
  });
});
