import fastify from 'fastify';
import { readingsRoutes } from './routes/readings';
import prisma from './plugins/prisma';
import jwtPlugin from './plugins/jwt';
import './services/mqtt';
import { devicesRoutes } from './routes/devices';
import { userRoutes } from './routes/users';
import cors from '@fastify/cors';

export const app = fastify();

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
app.register(prisma);
app.register(jwtPlugin);
app.register(readingsRoutes, {
  prefix: '/readings',
});
app.register(devicesRoutes, {
  prefix: '/devices',
});
app.register(userRoutes, {
  prefix: '/users',
});
