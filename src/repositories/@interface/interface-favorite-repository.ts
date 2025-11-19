import { Favorite, Prisma } from '@prisma/client';

import { FetchFavoritesQuery } from '../../@types/fetch-favorites-query';

export interface InterfaceFavoriteRepository {
  create(data: Prisma.FavoriteUncheckedCreateInput): Promise<Favorite>;

  findById(userId: string, policyId: number): Promise<Favorite | null>;

  findMany({
    page,
    userId,
    title,
    orderByCreated,
  }: FetchFavoritesQuery): Promise<{
    favorites: Favorite[];
    totalCount: number;
  }>;

  delete(userId: string, policyId: number): Promise<void>;
}
