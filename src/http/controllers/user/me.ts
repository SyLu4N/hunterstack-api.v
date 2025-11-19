import { FastifyRequest, FastifyReply } from 'fastify';

export async function me(req: FastifyRequest, res: FastifyReply) {
  await req.jwtVerify();

  const data = req.user as any;

  return res.status(200).send({
    user: {
      id: data.sub,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
    },
  });
}
