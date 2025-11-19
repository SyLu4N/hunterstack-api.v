import { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma';

type Props = {
  data: Prisma.FavoriteUncheckedCreateInput;
};

export async function createFavoritePrismaTest({ data }: Props) {
  const favorite = await prisma.favorite.create({ data });

  return { favorite };
}
