import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../../../../api/index';
import { createFavoritePrismaTest } from '../../../utils/test/createFavoritePrisma';
import { createPolicyPrismaTest } from '../../../utils/test/createPolicyPrisma';
import { createUserPrismaTest } from '../../../utils/test/createUserPrisma';

describe('Delete Favorite (e2e)', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Deve ser possível deletar uma política favoritada', async () => {
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
      .delete(`/favorites/${policy.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.statusCode).toEqual(204);
  });

  // ---

  it('Não deve ser possível deletar um favorito sem se autenticar', async () => {
    const response = await request(app.server).delete(`/favorites/1`);

    expect(response.statusCode).toEqual(401);
  });
});
