import { connect } from 'mqtt';
import { PrismaClient } from '@prisma/client';
import { env } from '../env';

const prisma = new PrismaClient();
const client = connect(env.MQTT_CONNECT);

const devicesCache = new Map<string, string>();
let buffer: { deviceId: string; value: number; createdAt: string }[] = [];

function getRisk(value: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (value < 300) return 'HIGH';
  if (value < 500) return 'MEDIUM';
  return 'LOW';
}

async function sendDataBufferToDb() {
  if (buffer.length > 0) {
    console.log(buffer);
    try {
      await prisma.dataReadings.createMany({
        data: buffer.map((item) => ({
          deviceId: item.deviceId,
          distance: item.value,
          danger: getRisk(item.value),
          createdAt: item.createdAt,
        })),
      });

      buffer = [];
    } catch (error) {
      console.log('Error buffer informations send to DB');
    }
  }
}

async function loadDevices() {
  const devices = await prisma.device.findMany({
    select: {
      key: true,
    },
  });

  devices.forEach((device) => devicesCache.set(device.key, device.key));

  console.log(devices);
}

client.on('connect', () => {
  console.log('teste');
  client.subscribe(env.TOPIC, (error) => {
    console.error(error);
  });
});

client.on('message', async (topic, payload) => {
  try {
    const [, , uuid] = topic.split('/');
    const data = payload.toString();

    console.log(uuid, data);

    const deviceId = devicesCache.get(uuid);

    if (!deviceId) return console.warn(`Device ${uuid} - is not found in list`);

    buffer.push({
      deviceId,
      value: +data,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in process mensage MQTT', error);
  }
});

setInterval(sendDataBufferToDb, 5000);
setInterval(loadDevices, 60000);

loadDevices();
