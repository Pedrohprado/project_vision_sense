import { FastifyInstance } from 'fastify';
import { getReadingsById } from '../controllers/readings';

export async function readingsRoutes(app: FastifyInstance) {
  app.get('/:deviceId', getReadingsById);
}
