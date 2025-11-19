import { Favorite } from '@prisma/client';

import { InterfaceFavoriteRepository } from '../../repositories/@interface/interface-favorite-repository';
import { InterfaceUserRepository } from '../../repositories/@interface/interface-user-repository';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';

interface FetchFavoritesUseCaseRequest {
  sessionId: string;
  page: number;
  title?: string;
  orderByCreated?: 'desc' | 'asc';
}

interface FetchFavoritesUseCaseResponse {
  favorites: Favorite[];
  totalCount: number;
}

export class FetchFavoritesUseCase {
  constructor(
    private favoriteRepository: InterfaceFavoriteRepository,
    private userRepository: InterfaceUserRepository,
  ) {}

  async execute({
    sessionId,
    page,
    orderByCreated,
    title,
  }: FetchFavoritesUseCaseRequest): Promise<FetchFavoritesUseCaseResponse> {
    const userExists = await this.userRepository.findById(sessionId);
    if (!userExists) {
      throw new ResourceNotFoundError('Usuário não encontrado.');
    }

    const { favorites, totalCount } = await this.favoriteRepository.findMany({
      userId: sessionId,
      page,
      title,
      orderByCreated,
    });

    return { favorites, totalCount };
  }
}
