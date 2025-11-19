import { InMemoryUsersRepository } from 'src/repositories/in-memory/in-memory-users-repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BadRequestError } from '../@errors/bad-request-error';
import { AuthGithubUseCase } from './auth-github';

let usersRepository: InMemoryUsersRepository;
let sut: AuthGithubUseCase;

describe('AuthGithubUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new AuthGithubUseCase(usersRepository);
    vi.restoreAllMocks();
  });

  it('Deve ser possível autenticar com sucesso e criar um novo usuário', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(async () =>
      Promise.resolve({
        json: async () => ({ access_token: 'FAKE_ACCESS_TOKEN' }),
      } as any),
    );

    vi.spyOn(global, 'fetch').mockImplementationOnce(async () =>
      Promise.resolve({
        json: async () => ({
          id: '123',
          email: 'john@example.com',
          name: 'John Doe',
          avatar_url: 'avatar.png',
        }),
      } as any),
    );

    const response = await sut.execute({ code: 'FAKE_ACCESS_TOKEN' });

    expect(response.user).toMatchObject({
      id: 'GH_123',
      email: 'john@example.com',
      name: 'John Doe',
      avatar: 'avatar.png',
    });
    expect(usersRepository.users).toHaveLength(1);
  });

  // ---

  it('Deve ser possível alterar os dados do usuário quando ele se reautenticar', async () => {
    await usersRepository.create({
      id: 'GH_123',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'avatar.png',
    });

    vi.spyOn(global, 'fetch').mockImplementationOnce(async () =>
      Promise.resolve({
        json: async () => ({ access_token: 'FAKE_ACCESS_TOKEN' }),
      } as any),
    );

    vi.spyOn(global, 'fetch').mockImplementationOnce(async () =>
      Promise.resolve({
        json: async () => ({
          id: '123',
          email: 'john@example.com',
          name: 'John One',
          avatar_url: 'avatar2.png',
        }),
      } as any),
    );

    const response = await sut.execute({ code: 'FAKE_ACCESS_TOKEN' });

    expect(response.user).toMatchObject({
      id: 'GH_123',
      email: 'john@example.com',
      name: 'John One',
      avatar: 'avatar2.png',
    });
    expect(usersRepository.users).toHaveLength(1);
  });

  // ---

  it('Não deve autenticar se o GitHub não retornar id', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async () =>
      Promise.resolve({
        json: async () => ({}),
      } as any),
    );

    await expect(sut.execute({ code: 'fake_code' })).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
