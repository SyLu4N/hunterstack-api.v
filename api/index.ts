import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyFormBody from '@fastify/formbody';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';
import {
  validatorCompiler,
  jsonSchemaTransform,
  serializerCompiler,
} from 'fastify-type-provider-zod';

import { env } from '../src/env/index';
import { categoriesRoutes } from '../src/http/controllers/category/routes';
import { favoritesRoutes } from '../src/http/controllers/favorite/routes';
import { policiesRoutes } from '../src/http/controllers/policy/routes';
import { scrapingRoutes } from '../src/http/controllers/scrape/routes';
import { usersRoutes } from '../src/http/controllers/user/routes';

export const app = fastify();

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: '7d' },
});

app.setNotFoundHandler((_req, res) => {
  return res
    .status(404)
    .send({ message: 'Algo deu errado, rota não encontrada.' });
});

/* app.register(
  fastifyCors,
  (
    req: FastifyRequest,
    callback: (err: Error | null, options?: any) => void,
  ) => {
    let corsOptions: any;

    if (req.url?.startsWith('/scraping')) {
      corsOptions = {
        origin: process.env.CLIENT_APP_ADM_URL,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      };
    } else if (
      req.url?.startsWith('/policies') ||
      req.url?.startsWith('/categories')
    ) {
      corsOptions = {
        origin: process.env.CLIENT_APP_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      };
    }

    callback(null, corsOptions);
  },
); */

app.register(fastifyCookie);
app.register(fastifyMultipart);
app.register(fastifyFormBody);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Politica de Segurança da Informação',
      description:
        'API para gerenciamento de políticas de segurança da informação',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(fastifyRateLimit, {
  max: 10,
  timeWindow: '1 second',
});

app.register(scrapingRoutes);
app.register(policiesRoutes);
app.register(categoriesRoutes);
app.register(usersRoutes);
app.register(favoritesRoutes);

app.setErrorHandler((error, _req, res) => {
  if (error.validation) {
    const errorZod = error.validation[0]?.message;

    return res.status(400).send({ message: errorZod });
  }

  const errorMessage =
    error.message || 'Algo deu errado, tente novamente mais tarde.';

  if (env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(error);
  }

  return res.status(500).send({ message: errorMessage, error });
});

export default async function handler(req: any, res: any) {
  await app.ready();
  app.server.emit('request', req, res);
}
