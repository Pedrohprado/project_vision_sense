import { connect } from 'mqtt';
import { PrismaClient } from '@prisma/client';
import { env } from '../env';
import { redis } from './redis';

const prisma = new PrismaClient();
const client = connect(env.MQTT_CONNECT);

const devicesCache = new Map<string, string>();
const topics: Set<string> = new Set();

function getRisk(value: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (value < 20) return 'HIGH';
  if (value < 50) return 'MEDIUM';
  return 'LOW';
}

async function loadDevices() {
  const devices = await prisma.device.findMany({
    select: {
      key: true,
    },
  });

  devices.forEach((device) => devicesCache.set(device.key, device.key));

  console.log('dispositivos encontrados', devices);
}

client.on('connect', () => {
  client.subscribe(env.TOPIC, (error) => {
    console.error(error);
  });
});

client.on('message', async (topic, payload) => {
  try {
    const [, uuid] = topic.split('/');
    const data = payload.toString();
    console.log(topic, uuid, data);
    const deviceId = devicesCache.get(uuid); // verifc

    if (!deviceId) return console.warn(` ${topic} - is not found in list`);

    topics.add(deviceId);
    await redis.lpush(deviceId, data);
  } catch (error) {
    console.error('Error in process mensage MQTT', error);
  }
});

async function showRedisData() {
  for (const topic of topics) {
    const values = await redis.lrange(topic, 0, -1); // pega tudo

    if (values.length === 0) continue; // evita insert vazio

    try {
      await prisma.dataReadings.createMany({
        data: values.map((value) => ({
          distance: +value,
          danger: getRisk(+value),
          deviceId: topic,
        })),
      });
      console.log(`Dados do tópico "${topic}":`, values);
      await redis.del(topic);
    } catch (error) {
      console.error(
        `❌ Erro ao salvar dados do tópico "${topic}" no Postgres:`,
        error
      );
    }
  }
}

setInterval(showRedisData, 5000);
setInterval(loadDevices, 60000);

loadDevices();
