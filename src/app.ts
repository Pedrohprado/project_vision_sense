import fastify from 'fastify';
import { readingsRoutes } from './routes/readings';
import prisma from './plugins/prisma';

export const app = fastify();

app.register(prisma);
app.register(readingsRoutes, {
  prefix: '/readings',
});
