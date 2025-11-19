import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { app } from '../../../../api/index';

describe('AuthGithub (HTTP)', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Deve ser possível autenticar com sucesso com o código do GitHub', async () => {
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

    const response = await request(app.server)
      .get('/auth/github/TEST')
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toMatchObject({
      id: 'GH_123',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'avatar.png',
    });
  });
});
