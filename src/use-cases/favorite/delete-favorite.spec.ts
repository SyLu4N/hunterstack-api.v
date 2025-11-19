import { describe, it, expect, beforeEach } from 'vitest';

import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';
import { DeleteFavoriteUseCase } from './delete-favorite';

let favoritesRepository: InMemoryFavoritesRepository;
let sut: DeleteFavoriteUseCase;

describe('DeleteFavoriteUseCase', () => {
  beforeEach(() => {
    favoritesRepository = new InMemoryFavoritesRepository();
    sut = new DeleteFavoriteUseCase(favoritesRepository);
  });

  it('Deve ser possível deletar um favorito', async () => {
    await favoritesRepository.create({ userId: 'TEST_1', policyId: 1 });

    const favorite = await favoritesRepository.create({
      userId: 'TEST_2',
      policyId: 2,
    });

    await expect(
      sut.execute({ policyId: favorite.policyId, sessionId: favorite.userId }),
    ).resolves.toBeUndefined();

    const { favorites, totalCount } = await favoritesRepository.findMany({
      userId: 'TEST_1',
      page: 1,
    });

    expect(totalCount).toBe(1);
    expect(favorites[0].userId).toBe('TEST_1');
  });

  // ---

  it('Não deve ser possível deletar um favorito que não existe.', async () => {
    await expect(
      sut.execute({ policyId: 0, sessionId: 'NOT_EXIST' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  // ---

  it('Não deve ser possível deletar um favorito que não pertece ao usuário', async () => {
    await favoritesRepository.create({ userId: 'TEST_1', policyId: 1 });

    await expect(
      sut.execute({ policyId: 1, sessionId: 'TEST_2' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
