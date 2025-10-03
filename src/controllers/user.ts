import { FastifyReply, FastifyRequest } from 'fastify';
import { app } from '../app';
import bcrypt from 'bcrypt';

export async function login(
  request: FastifyRequest<{
    Body: {
      email: string;
      password: string;
    };
  }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  const existingUser = await app.prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!existingUser)
    return reply.status(404).send({ message: 'Usuário não encontrado' });

  const isValidUser = await bcrypt.compare(password, existingUser.password);

  if (!isValidUser)
    return reply.status(401).send({ message: 'Email e/ou senha inválido' });

  const token = reply.server.jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
    },
    { expiresIn: '10d' }
  );

  return {
    token,
  };
}

export async function createUser(
  request: FastifyRequest<{
    Body: {
      email: string;
      password: string;
      name: string;
      age: string;
      height: number;
      weight: number;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { email, password, name, age, height, weight } = request.body;

    console.log(email);
    const existingUser = await app.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser)
      return reply.status(400).send({
        message: 'Usuário já cadastrado!',
      });

    const hashed = await bcrypt.hash(password, 10);

    await app.prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        age,
        height,
        weight,
      },
    });

    return reply.status(201).send();
  } catch (error) {
    console.error('Erro ao criar usuário');
    return reply.status(500).send({
      message: 'Erro ao criar usuário',
    });
  }
}
