import { InterfaceFavoriteRepository } from '../../repositories/@interface/interface-favorite-repository';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';

interface DeleteFavoriteUseCaseRequest {
  sessionId: string;
  policyId: number;
}

export class DeleteFavoriteUseCase {
  constructor(private favoriteRepository: InterfaceFavoriteRepository) {}

  async execute({ policyId, sessionId }: DeleteFavoriteUseCaseRequest) {
    const favorite = await this.favoriteRepository.findById(
      sessionId,
      policyId,
    );

    if (!favorite) {
      throw new ResourceNotFoundError('Favorito não encontrado.');
    }

    await this.favoriteRepository.delete(sessionId, policyId);

    return;
  }
}
