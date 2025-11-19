import { Favorite } from '@prisma/client';

import { InterfaceFavoriteRepository } from '../../repositories/@interface/interface-favorite-repository';
import { InterfacePolicyRepository } from '../../repositories/@interface/interface-policy-repository';
import { InterfaceUserRepository } from '../../repositories/@interface/interface-user-repository';
import { ResourceAlreadyExistsError } from '../@errors/resource-already-exists-error';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';

interface CreateFavoriteUseCaseRequest {
  sessionId: string;
  policyId: number;
}

interface CreateFavoriteUseCaseResponse {
  favorite: Favorite;
}

export class CreateFavoriteUseCase {
  constructor(
    private favoriteRepository: InterfaceFavoriteRepository,
    private policyRepository: InterfacePolicyRepository,
    private userRepository: InterfaceUserRepository,
  ) {}

  async execute({
    policyId,
    sessionId,
  }: CreateFavoriteUseCaseRequest): Promise<CreateFavoriteUseCaseResponse> {
    const userExists = await this.userRepository.findById(sessionId);
    if (!userExists) {
      throw new ResourceNotFoundError('Usuário não encontrado.');
    }

    const policyExists = await this.policyRepository.findById(policyId);
    if (!policyExists) {
      throw new ResourceNotFoundError('Política não encontrada.');
    }

    const favoriteAlreadyExists = await this.favoriteRepository.findById(
      sessionId,
      policyId,
    );

    if (favoriteAlreadyExists) {
      throw new ResourceAlreadyExistsError('Política já favoritada.');
    }

    const favorite = await this.favoriteRepository.create({
      policyId,
      userId: sessionId,
    });

    return { favorite };
  }
}
