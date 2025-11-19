import { FastifyInstance } from 'fastify';
import { verifyJWT } from 'src/http/middlewares/verify-jwt';
import { z } from 'zod';

import { createFavorite } from './create-favorite';
import { deleteFavorite } from './delete-favorite';
import { fetchFavorites } from './fetch-favorites';

export async function favoritesRoutes(app: FastifyInstance) {
  app.get('/favorites', {
    onRequest: [verifyJWT],

    schema: {
      summary: 'Listar os meus favoritos',
      description:
        'Listar os favoritos baseado no usuário que está executando a chamada.',

      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        title: z.string().optional(),
        orderByCreated: z.enum(['asc', 'desc']).optional(),
      }),

      response: {
        200: z
          .object({
            favorites: z.array(
              z.object({
                policy: z.object({
                  id: z.number(),
                  slug: z.string(),
                  title: z.string(),
                  category: z.object({ name: z.string(), slug: z.string() }),
                }),

                createdAt: z.date(),
              }),
            ),
            totalCount: z.number(),
          })
          .describe('Favorites found'),

        400: z.object({ message: z.string() }).describe('Bad request'),
      },
    },

    handler: fetchFavorites,
  });

  app.post('/favorites', {
    onRequest: [verifyJWT],

    schema: {
      summary: 'Favoritar uma política',

      description:
        'Favorita uma política, baseado no usuário que está executando a chamada.',

      body: z.object({
        policyId: z.coerce.number({
          invalid_type_error: 'ID da política inválido.',
        }),
      }),

      response: {
        201: z
          .object({
            userId: z.string(),
            policyId: z.number(),
            createdAt: z.date(),
          })
          .describe('Favorite created'),

        400: z.object({ message: z.string() }).describe('Bad request'),
      },
    },

    handler: createFavorite,
  });

  app.delete('/favorites/:policyId', {
    onRequest: [verifyJWT],

    schema: {
      summary: 'Desfavoritar uma política',

      description:
        'Desfavorita uma política baseado no usuário que está executando a chamada.',

      params: z.object({
        policyId: z.coerce.number({
          invalid_type_error: 'ID da policym inválido.',
        }),
      }),

      response: {
        204: z.null().describe('Favorite deleted'),

        400: z.object({ message: z.string() }).describe('Bad request'),
      },
    },

    handler: deleteFavorite,
  });
}
