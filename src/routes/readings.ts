import { FastifyInstance } from 'fastify';
import { getReadingsById } from '../controllers/readings';
import { authenticate } from '../middlewares/authenticate';

export async function readingsRoutes(app: FastifyInstance) {
  app.get('/:deviceId', {
    preHandler: [authenticate],
    handler: getReadingsById,
  });
}
