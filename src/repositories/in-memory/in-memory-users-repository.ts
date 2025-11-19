import { Prisma, User } from '@prisma/client';
import { FetchUsersQuery } from 'src/@types/fetch-users-query';

import { InterfaceUserRepository } from '../@interface/interface-user-repository';

export class InMemoryUsersRepository implements InterfaceUserRepository {
  public users: User[] = [];

  async create(data: Prisma.UserCreateInput) {
    const user = {
      ...data,

      createdAt: new Date(),
    } as User;

    this.users.push(user);

    return user;
  }

  async findById(userId: string) {
    const user = this.users.find((user) => user.id === userId);
    if (!user) return null;

    return user;
  }

  async findMany({ page, name }: FetchUsersQuery) {
    let users = this.users;

    if (name) {
      users = users.filter((user) => user.name.includes(name));
    }

    users = users.slice((page - 1) * 12, page * 12);

    return { users, totalCount: this.users.length };
  }

  async update(userId: string, data: Prisma.UserUpdateInput) {
    const userIndex = this.users.findIndex((user) => user.id === userId);
    const Userstorage = this.users.find((user) => user.id === userId);

    const user = { ...Userstorage, ...data } as User;
    this.users.splice(userIndex, 1, user);

    return user;
  }

  async delete(userId: string) {
    this.users = this.users.filter((user) => user.id !== userId);
  }
}
