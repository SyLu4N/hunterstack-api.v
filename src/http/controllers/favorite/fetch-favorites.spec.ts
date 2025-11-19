import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../../../../api/index';
import { createFavoritePrismaTest } from '../../../utils/test/createFavoritePrisma';
import { createPolicyPrismaTest } from '../../../utils/test/createPolicyPrisma';
import { createUserPrismaTest } from '../../../utils/test/createUserPrisma';

describe('Fetch Favorites (e2e)', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Deve ser possível consultar os meus favoritos', async () => {
    const { user } = await createUserPrismaTest({
      data: {
        id: 'TEST_1',
        name: 'John Doe',
        email: 'johndoe@example.com',
      },
    });

    const { policy } = await createPolicyPrismaTest({
      data: {
        title: 'Politica 1',
        description: 'Conteudo da politica 1',
        slug: 'policy-1',
        source: 'Fonte 1',
        summary: 'Resumo da politica 1',
        category: { create: { name: 'Categoria 1', slug: 'category-1' } },
      },
    });

    await createFavoritePrismaTest({
      data: { userId: user.id, policyId: policy.id },
    });

    const token = app.jwt.sign(
      { name: user.name, email: user.email, avatar: user.avatar },
      { sub: user.id },
    );

    const response = await request(app.server)
      .get(`/favorites?page=1`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.statusCode).toEqual(200);
    expect(response.body.favorites).toHaveLength(1);
    expect(response.body).toMatchObject({
      favorites: [
        {
          policy: { title: expect.any(String) },
          createdAt: expect.any(String),
        },
      ],
    });
  });

  // ---

  it('Não deve ser possível consultar os meus favoritos sem se autenticar', async () => {
    const response = await request(app.server).get('/favorites?page=1').send({
      policyId: 1,
      userId: 'TEST_1',
    });

    expect(response.statusCode).toBe(401);
  });
});
