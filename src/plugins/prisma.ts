import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient();

  // Conecta ao banco
  await prisma.$connect();

  // Decora o fastify com o prisma
  fastify.decorate('prisma', prisma);

  // Desconecta ao fechar o servidor
  fastify.addHook('onClose', async (app) => {
    await app.prisma.$disconnect();
  });
});
