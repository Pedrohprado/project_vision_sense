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

  let low = 0;
  let medium = 0;
  let high = 0;
  listReadings.map((reading) => {
    reading.danger === 'LOW'
      ? low + 1
      : reading.danger === 'MEDIUM'
      ? medium + 1
      : high + 1;
  });

  const porcent = {
    porcentLow: (low * 100) / listReadings.length,
    porcentMedium: (medium * 100) / listReadings.length,
    porcentHigh: (high * 100) / listReadings.length,
  };
  return { listReadings, porcent };
}
