import { Prisma } from '@prisma/client';

import { FetchFavoritesQuery } from '../../@types/fetch-favorites-query';
import { prisma } from '../../lib/prisma';
import { InterfaceFavoriteRepository } from '../@interface/interface-favorite-repository';

export class PrismaFavoritesRepository implements InterfaceFavoriteRepository {
  async create(data: Prisma.FavoriteUncheckedCreateInput) {
    const favorite = await prisma.favorite.create({ data });

    return favorite;
  }

  async findById(userId: string, policyId: number) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_policyId: {
          userId,
          policyId,
        },
      },
    });

    return favorite;
  }

  async findMany({ page, title, orderByCreated, userId }: FetchFavoritesQuery) {
    const where: Prisma.FavoriteWhereInput = { userId };
    const orderBy: Prisma.FavoriteOrderByWithRelationInput[] = [];

    const skip = (page - 1) * 12;
    const take = 12;

    if (title) where.policy!.title = { contains: title };
    if (orderByCreated) orderBy.push({ createdAt: orderByCreated });

    const select: Prisma.FavoriteSelect = {
      policy: {
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
        },
      },
      createdAt: true,
    };

    const [favorites, totalCount] = await Promise.all([
      prisma.favorite.findMany({
        skip,
        take,
        where,
        orderBy,
        select,
      }),

      prisma.favorite.count({ where }),
    ]);

    return { favorites, totalCount };
  }

  async delete(userId: string, policyId: number) {
    await prisma.favorite.delete({
      where: { userId_policyId: { userId, policyId } },
    });
  }
}
