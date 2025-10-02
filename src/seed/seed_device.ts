import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function registerDeviceTest() {
  await prisma.device.create({
    data: {
      key: 'RANDOM_GAS_MIL_GRAU',
      name: 'vision_sense',
      userId: 'c9685aca-9bf3-43a0-8c7f-a71a8656141c',
    },
  });
}

registerDeviceTest().then(() => {
  console.log('Device criado com sucesso');
  prisma.$disconnect();
});
