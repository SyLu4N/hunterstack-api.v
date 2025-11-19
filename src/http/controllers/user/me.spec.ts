import jwt from 'jsonwebtoken';
import { createUserPrismaTest } from 'src/utils/test/createUserPrisma';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../../../../api/index';
import { env } from '../../../env';

describe('Me (e2e)', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Deve ser possível resgatar o usuário por um token válido', async () => {
    const { user } = await createUserPrismaTest({
      data: {
        id: 'TEST_1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        avatar: '',
      },
    });

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: '7d',
    });

    const response = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toMatchObject({
      user: {
        name: user.name,
        email: user.email,
      },
    });
  });

  // ---

  it('Deve retornar 400 caso o token seja inválido', async () => {
    const response = await request(app.server)
      .get('/me')
      .set('Authorization', `INVALID_TOKEN`);

    expect(response.statusCode).toEqual(400);
  });

  // ---

  it('Deve retornar 404 caso o usuário não seja encontrado', async () => {
    const user = {
      id: 'TEST_2',
      name: 'John Doe',
      email: 'johndoe@example.com',
      avatar: '',
    };

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: '7d',
    });

    const response = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toEqual(404);
  });
});
