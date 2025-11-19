export type FetchFavoritesQuery = {
  page: number;
  userId: string;
  title?: string;
  orderByCreated?: 'desc' | 'asc';
};
