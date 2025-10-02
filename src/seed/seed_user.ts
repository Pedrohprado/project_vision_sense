import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function registerUserTest() {
  await prisma.user.create({
    data: {
      email: 'teste.teste@teste.com',
      name: 'teste',
      password: 'teste',
      age: '18',
      height: 1.83,
      weight: 80,
    },
  });
}

registerUserTest().then(() => {
  console.log('Usuário criado com sucesso');
  prisma.$disconnect();
});
