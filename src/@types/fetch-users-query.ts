export type FetchUsersQuery = {
  page: number;
  name?: string;
  orderByCreated?: 'desc' | 'asc';
};
