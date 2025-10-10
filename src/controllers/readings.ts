import { FastifyRequest } from 'fastify';
import { app } from '../app';

export async function getReadingsById(
  request: FastifyRequest<{ Params: { deviceId: string } }>
) {
  const { deviceId } = request.params;

  const listReadings = await app.prisma.dataReadings.findMany({
    where: { deviceId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  listReadings.reverse();

  return { listReadings };
}
