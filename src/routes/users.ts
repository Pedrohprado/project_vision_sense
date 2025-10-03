import { FastifyInstance } from 'fastify';
import { createUser, login } from '../controllers/user';

export async function userRoutes(app: FastifyInstance) {
  app.post('/', createUser);
  app.post('/login', login);
}
