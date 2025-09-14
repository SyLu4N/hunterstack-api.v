import { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma';

type Props = {
  data: Omit<Prisma.PolicyCreateInput, 'id'>;
};

export async function createPolicyPrismaTest({ data }: Props) {
  const policy = await prisma.policy.create({ data });

  return { policy };
}
