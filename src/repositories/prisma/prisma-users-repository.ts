import { Prisma } from '@prisma/client';
import { FetchUsersQuery } from 'src/@types/fetch-users-query';

import { prisma } from '../../lib/prisma';
import { InterfaceUserRepository } from '../@interface/interface-user-repository';

export class PrismaUsersRepository implements InterfaceUserRepository {
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({ data });

    return user;
  }

  async findById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    return user;
  }

  async findMany({ page, name, orderByCreated }: FetchUsersQuery) {
    const where: Prisma.UserWhereInput = {};
    const orderBy: Prisma.UserOrderByWithRelationInput[] = [];

    const skip = (page - 1) * 12;
    const take = 12;

    if (name) where.name = { contains: name };

    if (orderByCreated) orderBy.push({ createdAt: orderByCreated });

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
      }),

      prisma.user.count({ where }),
    ]);

    return { users, totalCount };
  }

  async update(userId: string, data: Prisma.UserUncheckedUpdateInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return user;
  }

  async delete(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }
}
