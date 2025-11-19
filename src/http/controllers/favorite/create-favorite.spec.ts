import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../../../../api/index';
import { createPolicyPrismaTest } from '../../../utils/test/createPolicyPrisma';
import { createUserPrismaTest } from '../../../utils/test/createUserPrisma';

describe('Create Favorite (e2e)', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Deve ser possível adicionar uma política aos favoritos', async () => {
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

    const token = app.jwt.sign(
      { name: user.name, email: user.email, avatar: user.avatar },
      { sub: user.id },
    );

    const response = await request(app.server)
      .post(`/favorites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ policyId: policy.id });

    expect(response.statusCode).toEqual(201);
    expect(response.body.userId).toBe(user.id);
    expect(response.body.policyId).toBe(policy.id);
  });

  // ---

  it('Não deve ser possível favoritar uma política sem se autenticar', async () => {
    const response = await request(app.server).post('/favorites').send({
      policyId: 1,
      userId: 'TEST_1',
    });

    expect(response.statusCode).toBe(401);
  });
});
