import { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma';

type Props = {
  data: Prisma.UserCreateInput;
};

export async function createUserPrismaTest({ data }: Props) {
  const user = await prisma.user.create({ data });

  return { user };
}
