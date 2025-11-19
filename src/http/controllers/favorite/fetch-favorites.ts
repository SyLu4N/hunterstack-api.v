import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaUsersRepository } from 'src/repositories/prisma/prisma-users-repository';
import { FetchFavoritesUseCase } from 'src/use-cases/favorite/fetch-favorites';
import { z } from 'zod';

import { PrismaFavoritesRepository } from '../../../repositories/prisma/prisma-favorites-repository';
import { ResourceNotFoundError } from '../../../use-cases/@errors/resource-not-found-error';

export async function fetchFavorites(req: FastifyRequest, res: FastifyReply) {
  const favoriteQuerysSchema = z.object({
    title: z.string({ invalid_type_error: 'Título inválido.' }).optional(),
    page: z.coerce.number().default(1),
    orderByCreated: z.enum(['asc', 'desc']).optional(),
  });

  const data = favoriteQuerysSchema.parse(req.query);

  const prismaFavoritesRepository = new PrismaFavoritesRepository();
  const prismaUsersRepository = new PrismaUsersRepository();

  const fetchFavoritesUseCase = new FetchFavoritesUseCase(
    prismaFavoritesRepository,
    prismaUsersRepository,
  );

  try {
    const response = await fetchFavoritesUseCase.execute({
      ...data,
      sessionId: req?.user?.sub,
    });

    return res.status(200).send(response);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return res.status(400).send({ message: error.message });
    }

    throw error;
  }
}
