import { describe, it, expect, beforeEach } from 'vitest';

import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';
import { FetchFavoritesUseCase } from './fetch-favorites';

let favoritesRepository: InMemoryFavoritesRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FetchFavoritesUseCase;

describe('FetchFavoritesUseCase', () => {
  beforeEach(() => {
    favoritesRepository = new InMemoryFavoritesRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FetchFavoritesUseCase(favoritesRepository, usersRepository);
  });

  it('Deve ser possível consultar os favoritos', async () => {
    await usersRepository.create({
      id: 'TEST_1',
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    await favoritesRepository.create({ userId: 'TEST_1', policyId: 1 });
    await favoritesRepository.create({ userId: 'TEST_1', policyId: 2 });

    const { favorites, totalCount } = await sut.execute({
      page: 1,
      sessionId: 'TEST_1',
    });

    expect(totalCount).toBe(2);
    expect(favorites).toMatchObject([{ policyId: 1 }, { policyId: 2 }]);
  });

  // ---

  it('Deve ser possível paginar os favoritos', async () => {
    await usersRepository.create({
      id: 'TEST_1',
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    for (let i = 1; i <= 14; i++) {
      await favoritesRepository.create({ userId: 'TEST_1', policyId: i });
    }

    const { favorites, totalCount } = await sut.execute({
      page: 2,
      sessionId: 'TEST_1',
    });

    expect(totalCount).toBe(14);
    expect(favorites).toHaveLength(2);
    expect(favorites).toMatchObject([{ policyId: 13 }, { policyId: 14 }]);
  });

  // ---

  it('Não deve ser possível consultar os favoritos se o usuário não existir', async () => {
    await favoritesRepository.create({ userId: 'TEST_1', policyId: 1 });

    await expect(
      sut.execute({ page: 1, sessionId: 'TEST_1' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
