import { FastifyRequest } from 'fastify';
import { app } from '../app';

export async function getReadingsById(
  request: FastifyRequest<{ Params: { deviceId: string } }>
) {
  const { deviceId } = request.params;

  const data = await app.prisma.dataReadings.findMany({
    where: {
      deviceId,
    },
  });

  const listReadings = data.slice(-200);

  return { listReadings };
}
