import { FastifyInstance } from 'fastify';
import { createNewDevice, listDevices } from '../controllers/devices';
import { authenticate } from '../middlewares/authenticate';

export async function devicesRoutes(app: FastifyInstance) {
  app.post('/', {
    preHandler: [authenticate],
    handler: createNewDevice,
  });
  app.get('/', {
    preHandler: [authenticate],
    handler: listDevices,
  });
}
