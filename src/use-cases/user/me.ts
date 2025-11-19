import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { env } from '../../env';
import { InterfaceUserRepository } from '../../repositories/@interface/interface-user-repository';
import { BadRequestError } from '../@errors/bad-request-error';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';

interface MeUseCaseRequest {
  token: string;
}

interface MeUseCaseResponse {
  user: User;
}

export class MeUseCase {
  constructor(private usersRepository: InterfaceUserRepository) {}

  async execute({ token }: MeUseCaseRequest): Promise<MeUseCaseResponse> {
    let userId: string;

    try {
      const { id } = jwt.verify(token, env.JWT_SECRET) as {
        id: string;
      };

      userId = id;
    } catch (error) {
      throw new BadRequestError('Token inválido ou expirado');
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) throw new ResourceNotFoundError('Usuário não encontrado.');

    return { user };
  }
}
