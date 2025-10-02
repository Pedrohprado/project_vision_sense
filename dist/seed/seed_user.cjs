// src/seed/seed_user.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();
async function registerUserTest() {
  await prisma.user.create({
    data: {
      email: "teste.teste@teste.com",
      name: "teste",
      password: "teste",
      age: "18",
      height: 1.83,
      weight: 80
    }
  });
}
registerUserTest().then(() => {
  console.log("Usu\xE1rio criado com sucesso");
  prisma.$disconnect();
});
