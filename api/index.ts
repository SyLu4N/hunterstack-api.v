import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyFormBody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import {
  validatorCompiler,
  jsonSchemaTransform,
  serializerCompiler,
} from 'fastify-type-provider-zod';

import { env } from '../src/env/index';
import { categoriesRoutes } from '../src/http/controllers/category/routes';
import { policiesRoutes } from '../src/http/controllers/policy/routes';
import { scrapingRoutes } from '../src/http/controllers/scrape/routes';

export const app = fastify();

app.register(fastifyCors, {
  origin: '*',
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

app.get('/', async (req, reply) => {
  return reply.status(200).type('text/html').send(html);
});

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"
    />
    <title>Hunterstack.io API</title>
    <meta
      name="description"
      content="Hunterstack-api"
    />
  </head>

  <body>
    <h1>Vercel + Fastify Hunterstack.io API</h1>
    
    <p>
      RODANDO...
    </p>
  </body>
</html>
`;

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
