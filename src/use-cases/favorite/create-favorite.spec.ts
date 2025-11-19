import { describe, it, expect, beforeEach } from 'vitest';

import { InMemoryCategoriesRepository } from '../../repositories/in-memory/in-memory-categories-repository';
import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryPoliciesRepository } from '../../repositories/in-memory/in-memory-policies-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { ResourceAlreadyExistsError } from '../@errors/resource-already-exists-error';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';
import { CreateFavoriteUseCase } from './create-favorite';

let usersRepository: InMemoryUsersRepository;
let categoriesRepository: InMemoryCategoriesRepository;
let policiesRepository: InMemoryPoliciesRepository;
let favoritesRepository: InMemoryFavoritesRepository;
let sut: CreateFavoriteUseCase;

describe('CreateFavoriteUseCase', () => {
  beforeEach(() => {
    favoritesRepository = new InMemoryFavoritesRepository();
    usersRepository = new InMemoryUsersRepository();
    policiesRepository = new InMemoryPoliciesRepository();
    categoriesRepository = new InMemoryCategoriesRepository();

    sut = new CreateFavoriteUseCase(
      favoritesRepository,
      policiesRepository,
      usersRepository,
    );
  });

  it('Deve ser possível favoritar uma política e salvar pelo usuário.', async () => {
    const user = await usersRepository.create({
      id: 'TEST_1',
      name: 'John Doe',
      email: 'R7tZ0@example.com',
    });

    const category = await categoriesRepository.create({
      name: 'Segurança da Informação',
      slug: 'seguranca-da-informacao',
      policies: [] as any,
    });

    const policy = await policiesRepository.create({
      title: 'Política de Backup',
      slug: 'politica-de-backup',
      summary: 'Descrição resumida da policym de backup',
      description: 'Descrição detalhada da policym de backup',
      source: 'Empresa XYZ',
      category: { connect: { id: category.id } } as any,
    });

    const { favorite } = await sut.execute({
      sessionId: user.id,
      policyId: policy.id,
    });

    expect(favorite).toMatchObject({
      userId: user.id,
      policyId: policy.id,
    });
  });

  // ---

  it('Não deve ser possível favoritar uma politica que já foi favoritada.', async () => {
    const user = await usersRepository.create({
      id: 'TEST_1',
      name: 'John Doe',
      email: 'R7tZ0@example.com',
    });

    const category = await categoriesRepository.create({
      name: 'Segurança da Informação',
      slug: 'seguranca-da-informacao',
      policies: [] as any,
    });

    const policy = await policiesRepository.create({
      title: 'Política de Backup',
      slug: 'politica-de-backup',
      summary: 'Descrição resumida da policym de backup',
      description: 'Descrição detalhada da policym de backup',
      source: 'Empresa XYZ',
      category: { connect: { id: category.id } } as any,
    });

    const data = {
      sessionId: user.id,
      policyId: policy.id,
    };

    await sut.execute({ ...data });

    await expect(sut.execute({ ...data })).rejects.toBeInstanceOf(
      ResourceAlreadyExistsError,
    );
  });

  // ---

  it('Não deve ser possível favoritar uma politica que não existe', async () => {
    const user = await usersRepository.create({
      id: 'TEST_1',
      name: 'John Doe',
      email: 'R7tZ0@example.com',
    });

    const data = {
      sessionId: user.id,
      policyId: 0,
    };

    await expect(sut.execute({ ...data })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  // ---

  it('Não deve ser possível favoritar uma politica se não tiver um usuário autenticado', async () => {
    const category = await categoriesRepository.create({
      name: 'Segurança da Informação',
      slug: 'seguranca-da-informacao',
      policies: [] as any,
    });

    const policy = await policiesRepository.create({
      title: 'Política de Backup',
      slug: 'politica-de-backup',
      summary: 'Descrição resumida da policym de backup',
      description: 'Descrição detalhada da policym de backup',
      source: 'Empresa XYZ',
      category: { connect: { id: category.id } } as any,
    });

    const data = {
      policyId: policy.id,
      sessionId: 'IS_NOT_AUTHENTICATED',
    };

    await expect(sut.execute({ ...data })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
