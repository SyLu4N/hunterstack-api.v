import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      name: string;
      email: string;
      avatar?: string | null;
    };

    user: { sub: string };
  }
}
