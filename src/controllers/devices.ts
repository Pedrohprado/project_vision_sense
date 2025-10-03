import { FastifyReply, FastifyRequest } from 'fastify';
import { app } from '../app';

export async function createNewDevice(
  request: FastifyRequest<{
    Body: {
      key: string;
      name: string;
    };
  }>,
  reply: FastifyReply
) {
  const { key, name } = request.body;
  const user = request.user as { id: string; email: string };

  await app.prisma.device.create({
    data: {
      key,
      name,
      userId: user.id,
    },
  });

  reply.send('dipositivo criado com sucesso!');
}

export async function listDevices(request: FastifyRequest) {
  const user = request.user as { id: string };

  const devices = await app.prisma.device.findMany({
    where: {
      userId: user.id,
    },
  });

  return { devices };
}
