import { Prisma, User } from '@prisma/client';
import { FetchUsersQuery } from 'src/@types/fetch-users-query';

export interface InterfaceUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;

  findById(userId: string): Promise<User | null>;

  findMany({ page, name, orderByCreated }: FetchUsersQuery): Promise<{
    users: User[];
    totalCount: number;
  }>;

  update(userId: string, data: Prisma.UserUpdateInput): Promise<User>;

  delete(userId: string): Promise<void>;
}
