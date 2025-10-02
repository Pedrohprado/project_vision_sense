var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_fastify = __toESM(require("fastify"), 1);

// src/controllers/readings.ts
async function getReadingsById(request, reply) {
  const { deviceId } = request.params;
  const listReadings = await app.prisma.dataReadings.findMany({
    where: {
      deviceId
    }
  });
  return { listReadings };
}

// src/routes/readings.ts
async function readingsRoutes(app2) {
  app2.get("/:deviceId", getReadingsById);
}

// src/plugins/prisma.ts
var import_fastify_plugin = __toESM(require("fastify-plugin"), 1);
var import_client = require("@prisma/client");
var prisma_default = (0, import_fastify_plugin.default)(async (fastify2) => {
  const prisma2 = new import_client.PrismaClient();
  await prisma2.$connect();
  fastify2.decorate("prisma", prisma2);
  fastify2.addHook("onClose", async (app2) => {
    await app2.prisma.$disconnect();
  });
});

// src/services/mqtt.ts
var import_mqtt = require("mqtt");
var import_client2 = require("@prisma/client");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string(),
  HOST: import_zod.z.string().default("127.0.0.1"),
  PORT: import_zod.z.string().default("3333"),
  TOPIC: import_zod.z.string(),
  MQTT_CONNECT: import_zod.z.string()
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  const err = import_zod.z.treeifyError(_env.error).properties;
  console.error("Invalid environment variables!", err);
  throw new Error("Invalid enviroment variables!");
}
var env = _env.data;

// src/services/redis.ts
var import_ioredis = __toESM(require("ioredis"), 1);
var redis = new import_ioredis.default({
  host: "127.0.0.1",
  port: 6379
});
redis.on("connect", () => {
  console.log("\u2705 conectado ao Redis com suceso!");
});
redis.on("ready", () => {
  console.log("\u{1F680} Redis pronto para uso");
});
redis.on("error", (err) => {
  console.error("\u274C Erro na conex\xE3o com Redis:", err);
});

// src/services/mqtt.ts
var prisma = new import_client2.PrismaClient();
var client = (0, import_mqtt.connect)(env.MQTT_CONNECT);
var topics = /* @__PURE__ */ new Set();
client.on("connect", () => {
  console.log("teste");
  client.subscribe(env.TOPIC, (error) => {
    console.error(error);
  });
});
client.on("message", async (topic, payload) => {
  try {
    const data = payload.toString();
    console.log("oi", data);
    topics.add(topic);
    await redis.lpush(topic, data);
  } catch (error) {
    console.error("Error in process mensage MQTT", error);
  }
});
async function showRedisData() {
  for (const topic of topics) {
    const values = await redis.lrange(topic, 0, -1);
    console.log(`Dados do t\xF3pico "${topic}":`, values);
  }
}
setInterval(showRedisData, 5e3);

// src/app.ts
var app = (0, import_fastify.default)();
app.register(prisma_default);
app.register(readingsRoutes, {
  prefix: "/readings"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
