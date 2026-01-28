// User & Auth Types
export type UserRole = 'admin' | 'seller' | 'buyer';
export type UserStatus = 'active' | 'banned' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
}

// Category Types
export type CategoryStatus = 'active' | 'hidden';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  icon?: string;
  image?: string;
  description?: string;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
}

// Brand Types
export type BrandStatus = 'active' | 'hidden';

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  status: BrandStatus;
  createdAt: Date;
  productCount?: number;
}

// Product Types
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'DRAFT';

export interface ProductVariant {
  value: string;
  options: string[];
}

export interface ProductSKU {
  id?: string;
  value: string;
  quantity: number;
  price: number;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  logo?: string;
}

export interface ProductShop {
  id: string;
  name: string;
  logo?: string;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  virtualPrice?: number;
  brandId: string;
  brand?: ProductBrand;
  shopId: string;
  shop?: ProductShop;
  images: string[];
  variants?: ProductVariant[];
  description?: string;
  sizeGuide?: string;
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  wardId?: number;
  wardName?: string;
  status: ProductStatus;
  categories?: ProductCategory[];
  skus?: ProductSKU[];
  createdAt: Date | string;
  updatedAt: Date | string;
  createdById?: string;
  updatedById?: string;
  deletedAt?: Date | string | null;
  deletedById?: string | null;
}

// Pagination Types for Products
export interface ProductsPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ProductsData {
  products: Product[];
  pagination: ProductsPagination;
}

// Shop Types
export type ShopStatus = 'active' | 'suspended' | 'pending';
export type ShopVerification = 'verified' | 'unverified';

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  logo?: string;
  cover?: string;
  description?: string;
  verification: ShopVerification;
  rating: number;
  totalProducts: number;
  totalOrders?: number;
  totalRevenue?: number;
  status: ShopStatus;
  createdAt: Date;
}

// Order Types
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'shipping' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
}

// Promotion Types
export type PromotionStatus = 'active' | 'inactive' | 'expired';
export type DiscountType = 'percent' | 'fixed';

export interface Promotion {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  status: PromotionStatus;
  createdAt: Date;
}

// Review Types
export type ReviewStatus = 'visible' | 'hidden' | 'reported';
export type ReviewType = 'product' | 'shop';

export interface Review {
  id: string;
  type: ReviewType;
  targetId: string;
  targetName: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  content: string;
  images?: string[];
  status: ReviewStatus;
  createdAt: Date;
}

// Media Types
export type MediaType = 'image' | 'video';
export type MediaStatus = 'active' | 'hidden';

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  fileName: string;
  fileSize: number;
  duration?: number; // for videos
  uploaderId: string;
  uploaderName: string;
  status: MediaStatus;
  createdAt: Date;
}

// Log Types
export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

export interface Log {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  level: LogLevel;
  createdAt: Date;
  details?: string;
}

// Dashboard KPI Types
export interface KPICard {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
}

export interface ChartDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface CategorySalesData {
  name: string;
  sales: number;
  orders: number;
}

export interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}
