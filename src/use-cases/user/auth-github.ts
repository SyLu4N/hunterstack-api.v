import { env } from 'src/env';
import { InterfaceUserRepository } from 'src/repositories/@interface/interface-user-repository';

import { BadRequestError } from '../@errors/bad-request-error';

interface AuthGithubUseCaseRequest {
  code: string;
}

interface AuthGithubUseCaseResponse {
  user: { id: string; name: string; email: string; avatar?: string | null };
}

type UserAuthGithub = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
};

export class AuthGithubUseCase {
  constructor(private usersRepository: InterfaceUserRepository) {}

  async execute({
    code,
  }: AuthGithubUseCaseRequest): Promise<AuthGithubUseCaseResponse> {
    const accessTokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    const { access_token } = await accessTokenResponse.json();

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = (await userResponse.json()) as UserAuthGithub;
    if (!userData.id) {
      throw new BadRequestError('Não foi possível localizar o id do usuário.');
    }

    const { id, email, name, avatar_url: avatar } = userData;
    const prefixedId = `GH_${id}`;

    let user = await this.usersRepository.findById(prefixedId);

    if (!user) {
      const createUser = await this.usersRepository.create({
        id: prefixedId,
        email,
        name,
        avatar,
      });

      user = createUser;
    } else {
      if (
        user.email !== email ||
        user.name !== name ||
        user.avatar !== avatar
      ) {
        const userUpdated = await this.usersRepository.update(prefixedId, {
          email,
          name,
          avatar,
        });

        user = userUpdated;
      }
    }

    if (!user) {
      throw new BadRequestError('Falha na criação ou atualização do usuário.');
    }

    return { user };
  }
}
