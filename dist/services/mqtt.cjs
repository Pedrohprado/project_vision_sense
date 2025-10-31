// src/services/mqtt.ts
var import_mqtt = require("mqtt");
var import_client = require("@prisma/client");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string(),
  HOST: import_zod.z.string().default("127.0.0.1"),
  PORT: import_zod.z.string().default("3333"),
  TOPIC: import_zod.z.string(),
  MQTT_CONNECT: import_zod.z.string(),
  SECRET_KEY: import_zod.z.string()
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  const err = import_zod.z.treeifyError(_env.error).properties;
  console.error("Invalid environment variables!", err);
  throw new Error("Invalid enviroment variables!");
}
var env = _env.data;

// src/services/mqtt.ts
var prisma = new import_client.PrismaClient();
var client = (0, import_mqtt.connect)(env.MQTT_CONNECT);
var devicesCache = /* @__PURE__ */ new Map();
var buffer = [];
function getRisk(value) {
  if (value < 500) return "HIGH";
  if (value < 700) return "MEDIUM";
  return "LOW";
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
          createdAt: item.createdAt
        }))
      });
      buffer = [];
    } catch (error) {
      console.log("Error buffer informations send to DB");
    }
  }
}
async function loadDevices() {
  const devices = await prisma.device.findMany({
    select: {
      key: true
    }
  });
  devices.forEach((device) => devicesCache.set(device.key, device.key));
  console.log(devices);
}
client.on("connect", () => {
  console.log("teste");
  client.subscribe(env.TOPIC, (error) => {
    console.error(error);
  });
});
client.on("message", async (topic, payload) => {
  try {
    const [, , uuid] = topic.split("/");
    const data = payload.toString();
    console.log(uuid, data);
    const deviceId = devicesCache.get(uuid);
    if (!deviceId) return console.warn(`Device ${uuid} - is not found in list`);
    buffer.push({
      deviceId,
      value: +data,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error in process mensage MQTT", error);
  }
});
setInterval(sendDataBufferToDb, 5e3);
setInterval(loadDevices, 3e4);
loadDevices();
