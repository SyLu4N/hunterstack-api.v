import { Favorite, Prisma } from '@prisma/client';
import { FetchFavoritesQuery } from 'src/@types/fetch-favorites-query';

import { InterfaceFavoriteRepository } from '../@interface/interface-favorite-repository';

export class InMemoryFavoritesRepository
  implements InterfaceFavoriteRepository
{
  public favorites: Favorite[] = [];

  async create(data: Prisma.FavoriteUncheckedCreateInput) {
    const favorite = {
      ...data,

      createdAt: new Date(),
    } as Favorite;

    this.favorites.push(favorite);

    return favorite;
  }

  async findById(userId: string, policyId: number) {
    const favorite = this.favorites.find(
      (favorite) =>
        favorite.userId === userId && favorite.policyId === policyId,
    );

    if (!favorite) return null;

    return favorite;
  }

  async findMany({ page }: FetchFavoritesQuery) {
    let favorites = this.favorites;

    favorites = favorites.slice((page - 1) * 12, page * 12);

    return { favorites, totalCount: this.favorites.length };
  }

  async delete(userId: string, policyId: number) {
    this.favorites = this.favorites.filter(
      (favorite) =>
        favorite.userId !== userId && favorite.policyId !== policyId,
    );
  }
}
