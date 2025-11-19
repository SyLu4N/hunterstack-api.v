import { FastifyRequest, FastifyReply } from 'fastify';
import { BadRequestError } from 'openai';
import { z } from 'zod';

import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-repository';
import { AuthGithubUseCase } from '../../../use-cases/user/auth-github';

export async function authGithub(req: FastifyRequest, res: FastifyReply) {
  const ParamsSchema = z.object({
    code: z.string({ invalid_type_error: 'Código do GitHub Auth inválido.' }),
  });

  const { code } = ParamsSchema.parse(req.params);

  const usersReposityr = new PrismaUsersRepository();
  const authGithubUseCase = new AuthGithubUseCase(usersReposityr);

  try {
    const { user } = await authGithubUseCase.execute({ code });

    const token = await res.jwtSign(
      { name: user.name, email: user.email, avatar: user.avatar },
      { sign: { sub: user.id } },
    );

    return res.status(200).send({ token, user });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return res.status(400).send({ message: error.message });
    }

    throw error;
  }
}
