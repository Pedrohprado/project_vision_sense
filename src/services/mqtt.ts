import { connect } from 'mqtt';
import { PrismaClient } from '@prisma/client';
import { env } from '../env';

const prisma = new PrismaClient();
const client = connect(env.MQTT_CONNECT);

const devicesCache = new Map<string, string>();
let buffer: { deviceId: string; value: number }[] = [];

function getRisk(value: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (value < 20) return 'HIGH';
  if (value < 50) return 'MEDIUM';
  return 'LOW';
}

async function saveBuffer() {
  if (buffer.length > 0) {
    const toSave = buffer;
    buffer = [];
    await prisma.dataReadings.createMany({
      data: toSave.map((save) => ({
        deviceId: save.deviceId,
        distance: save.value,
        danger: getRisk(save.value),
      })),
    });
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
    const [, uuid] = topic.split('/');
    const data = payload.toString();

    console.log('oi', data);

    const deviceId = devicesCache.get(uuid);

    if (!deviceId) return console.warn(`Device ${uuid} - is not found in list`);

    buffer.push({ deviceId, value: +data });
  } catch (error) {
    console.error('Error in process mensage MQTT', error);
  }
});

setInterval(saveBuffer, 1000); // grava a cada 1ss
setInterval(loadDevices, 60000);

loadDevices();
