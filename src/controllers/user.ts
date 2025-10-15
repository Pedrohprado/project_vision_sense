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

  const isValidUser = await bcrypt.compare(
    password,
    existingUser.hashed_password
  );

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
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { email, password, name } = request.body;

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

    const user = await app.prisma.user.create({
      data: {
        email,
        hashed_password: hashed,
        name,
      },
    });

    const token = reply.server.jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      { expiresIn: '10d' }
    );

    return reply.status(201).send({
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.log(error);
    return reply.status(500).send({
      message: 'Erro ao criar usuário',
    });
  }
}
