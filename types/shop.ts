export interface ShopDto {
  id: string;
  createdById: string;
  updatedById: string;
  deletedById: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  name: string;
  description: string;
  logo: string;
  address: string;
  phone: string;
  rating: number;
  isOpen: boolean;
}

export interface GetManyShopsResponse {
  data: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    shops: ShopDto[];
  };
  message: string;
  statusCode: number;
  processId: string;
  duration: string;
}
