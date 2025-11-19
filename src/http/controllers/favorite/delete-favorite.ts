import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { PrismaFavoritesRepository } from '../../../repositories/prisma/prisma-favorites-repository';
import { ResourceNotFoundError } from '../../../use-cases/@errors/resource-not-found-error';
import { DeleteFavoriteUseCase } from '../../../use-cases/favorite/delete-favorite';

export async function deleteFavorite(req: FastifyRequest, res: FastifyReply) {
  const favoriteParamsSchema = z.object({
    policyId: z.coerce.number({
      invalid_type_error: 'ID da política inválido.',
    }),
  });

  const { policyId } = favoriteParamsSchema.parse(req.params);

  const prismaFavoritesRepository = new PrismaFavoritesRepository();

  const deleteFavoriteUseCase = new DeleteFavoriteUseCase(
    prismaFavoritesRepository,
  );

  try {
    await deleteFavoriteUseCase.execute({
      policyId,
      sessionId: req?.user?.sub,
    });

    return res.status(204).send();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return res.status(400).send({ message: error.message });
    }

    throw error;
  }
}
