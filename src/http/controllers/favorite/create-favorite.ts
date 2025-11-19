import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { PrismaFavoritesRepository } from '../../../repositories/prisma/prisma-favorites-repository';
import { PrismaPoliciesRepository } from '../../../repositories/prisma/prisma-policies-repository';
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-repository';
import { ResourceAlreadyExistsError } from '../../../use-cases/@errors/resource-already-exists-error';
import { ResourceNotFoundError } from '../../../use-cases/@errors/resource-not-found-error';
import { CreateFavoriteUseCase } from '../../../use-cases/favorite/create-favorite';

export async function createFavorite(req: FastifyRequest, res: FastifyReply) {
  const favoriteBodySchema = z.object({
    policyId: z.coerce.number({
      invalid_type_error: 'ID da política inválido.',
    }),
  });

  const { policyId } = favoriteBodySchema.parse(req.body);

  const prismaFavoritesRepository = new PrismaFavoritesRepository();
  const prismaPoliciesRepository = new PrismaPoliciesRepository();
  const prismaUsersRepository = new PrismaUsersRepository();

  const createFavoriteUseCase = new CreateFavoriteUseCase(
    prismaFavoritesRepository,
    prismaPoliciesRepository,
    prismaUsersRepository,
  );

  try {
    const { favorite } = await createFavoriteUseCase.execute({
      policyId,
      sessionId: req?.user?.sub,
    });

    return res.status(201).send(favorite);
  } catch (error) {
    if (error instanceof ResourceAlreadyExistsError) {
      return res.status(400).send({ message: error.message });
    }

    if (error instanceof ResourceNotFoundError) {
      return res.status(400).send({ message: error.message });
    }

    throw error;
  }
}
