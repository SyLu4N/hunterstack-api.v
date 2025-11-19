import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { authGithub } from './auth-github';
import { me } from './me';

const ParamsSchema = z.object({
  code: z.string({ message: 'Código Auth inválido.' }),
});

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/auth/github/:code',
    {
      schema: {
        summary: 'Autenticar o usuário usando o GitHub',
        description: 'Recebe o code do GitHub e retorna o token do usuário',
        params: ParamsSchema,

        response: {
          200: z
            .object({
              token: z.string(),
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                avatar: z.string().optional(),
              }),
            })
            .describe('Usuário autenticado com sucesso.'),

          400: z.object({ message: z.string() }).describe('Bad request'),
          404: z.object({ message: z.string() }).describe('Not found'),
        },
      },
    },

    authGithub,
  );

  app.get(
    '/me',
    {
      schema: {
        summary: 'Validar um token e retornar um usuário',
        description: 'Recebe um token e retorna o usuário se válido',

        response: {
          200: z
            .object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                avatar: z.string().optional(),
              }),
            })
            .describe('Token válido.'),

          400: z.object({ message: z.string() }).describe('Bad request'),
          404: z.object({ message: z.string() }).describe('Not found'),
        },
      },
    },

    me,
  );
}
