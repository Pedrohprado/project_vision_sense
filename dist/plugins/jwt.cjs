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

// src/plugins/jwt.ts
var jwt_exports = {};
__export(jwt_exports, {
  default: () => jwt_default
});
module.exports = __toCommonJS(jwt_exports);
var import_jwt = __toESM(require("@fastify/jwt"), 1);
var import_fastify_plugin = __toESM(require("fastify-plugin"), 1);

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
var jwt_default = (0, import_fastify_plugin.default)(async (fastify) => {
  const secret = env.SECRET_KEY;
  if (!secret) {
    fastify.log.error("\u274C JWT SECRET_KEY n\xE3o definida no .env");
    throw new Error("SECRET_KEY ausente no .env");
  }
  fastify.register(import_jwt.default, {
    secret
  });
});
