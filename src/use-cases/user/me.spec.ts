import jwt from 'jsonwebtoken';
import { InMemoryUsersRepository } from 'src/repositories/in-memory/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { env } from '../../env';
import { BadRequestError } from '../@errors/bad-request-error';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';
import { MeUseCase } from './me';

let usersRepository: InMemoryUsersRepository;
let sut: MeUseCase;

describe('MeUseCases', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new MeUseCase(usersRepository);
  });

  it('Deve ser possível validar um token e retornar um usuário', async () => {
    const user = await usersRepository.create({
      id: 'TEST_1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      avatar: '',
    });

    const token = jwt.sign(user, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: '7d',
    });

    const response = await sut.execute({ token });

    expect(response.user).toMatchObject({ name: user.name, email: user.email });
  });

  // ---

  it('Não deve ser possível validar um token inválido', async () => {
    await expect(
      sut.execute({ token: 'INVALID_TOKEN' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  // ---

  it('Não deve ser possível validar um token a qual não pertence a um usuário', async () => {
    const token = jwt.sign({ id: 'USER_NOT_EXISTS' }, env.JWT_SECRET, {
      subject: 'USER_NOT_EXISTS',
      expiresIn: '7d',
    });

    await expect(sut.execute({ token })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
