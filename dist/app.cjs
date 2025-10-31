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
async function getReadingsById(request) {
  const { deviceId } = request.params;
  const listReadings = await app.prisma.dataReadings.findMany({
    where: { deviceId },
    orderBy: { createdAt: "desc" },
    take: 200
  });
  listReadings.reverse();
  let low = 0;
  let medium = 0;
  let high = 0;
  listReadings.map((reading) => {
    reading.danger === "LOW" ? low + 1 : reading.danger === "MEDIUM" ? medium + 1 : high + 1;
  });
  const porcent = {
    porcentLow: low * 100 / listReadings.length,
    porcentMedium: medium * 100 / listReadings.length,
    porcentHigh: high * 100 / listReadings.length
  };
  return { listReadings, porcent };
}

// src/middlewares/authenticate.ts
async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send({ message: "Token inv\xE1lido ou ausente" });
  }
}

// src/routes/readings.ts
async function readingsRoutes(app2) {
  app2.get("/:deviceId", {
    preHandler: [authenticate],
    handler: getReadingsById
  });
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

// src/plugins/jwt.ts
var import_jwt = __toESM(require("@fastify/jwt"), 1);
var import_fastify_plugin2 = __toESM(require("fastify-plugin"), 1);

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

// src/plugins/jwt.ts
var jwt_default = (0, import_fastify_plugin2.default)(async (fastify2) => {
  const secret = env.SECRET_KEY;
  if (!secret) {
    fastify2.log.error("\u274C JWT SECRET_KEY n\xE3o definida no .env");
    throw new Error("SECRET_KEY ausente no .env");
  }
  fastify2.register(import_jwt.default, {
    secret
  });
});

// src/services/mqtt.ts
var import_mqtt = require("mqtt");
var import_client2 = require("@prisma/client");
var prisma = new import_client2.PrismaClient();
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

// src/controllers/devices.ts
async function createNewDevice(request, reply) {
  const { key, name } = request.body;
  const user = request.user;
  await app.prisma.device.create({
    data: {
      key,
      name,
      userId: user.id
    }
  });
  reply.send("dipositivo criado com sucesso!");
}
async function listDevices(request) {
  const user = request.user;
  const devices = await app.prisma.device.findMany({
    where: {
      userId: user.id
    }
  });
  return { devices };
}

// src/routes/devices.ts
async function devicesRoutes(app2) {
  app2.post("/", {
    preHandler: [authenticate],
    handler: createNewDevice
  });
  app2.get("/", {
    preHandler: [authenticate],
    handler: listDevices
  });
}

// src/controllers/user.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);
async function login(request, reply) {
  const { email, password } = request.body;
  const existingUser = await app.prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!existingUser)
    return reply.status(404).send({ message: "Usu\xE1rio n\xE3o encontrado" });
  const isValidUser = await import_bcrypt.default.compare(
    password,
    existingUser.hashed_password
  );
  if (!isValidUser)
    return reply.status(401).send({ message: "Email e/ou senha inv\xE1lido" });
  const token = reply.server.jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email
    },
    { expiresIn: "10d" }
  );
  return {
    token,
    email: existingUser.email,
    name: existingUser.name
  };
}
async function createUser(request, reply) {
  try {
    const { email, password, name } = request.body;
    console.log(email);
    const existingUser = await app.prisma.user.findUnique({
      where: {
        email
      }
    });
    if (existingUser)
      return reply.status(400).send({
        message: "Usu\xE1rio j\xE1 cadastrado!"
      });
    const hashed = await import_bcrypt.default.hash(password, 10);
    const user = await app.prisma.user.create({
      data: {
        email,
        hashed_password: hashed,
        name
      }
    });
    const token = reply.server.jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      { expiresIn: "10d" }
    );
    return reply.status(201).send({
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.log(error);
    return reply.status(500).send({
      message: "Erro ao criar usu\xE1rio"
    });
  }
}

// src/routes/users.ts
async function userRoutes(app2) {
  app2.post("/", createUser);
  app2.post("/login", login);
}

// src/app.ts
var import_cors = __toESM(require("@fastify/cors"), 1);
var app = (0, import_fastify.default)();
app.register(import_cors.default, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
});
app.register(prisma_default);
app.register(jwt_default);
app.register(readingsRoutes, {
  prefix: "/readings"
});
app.register(devicesRoutes, {
  prefix: "/devices"
});
app.register(userRoutes, {
  prefix: "/users"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
