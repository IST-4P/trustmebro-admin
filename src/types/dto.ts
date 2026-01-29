// ============================================
// DASHBOARD DTOs
// ============================================

export interface DashboardSellerResponseDto {
  data: {
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    revenue: number;
  };
}

// ============================================
// PRODUCT DTOs
// ============================================

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductSKU {
  sku: string;
  price: number;
  stock: number;
  variantValues: Record<string, string>;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  virtualPrice: number;
  brandId: string;
  images: string[];
  variants: ProductVariant[];
  description: string;
  sizeGuide?: string;
  provinceId: string;
  provinceName: string;
  districtId: string;
  districtName: string;
  wardId: string;
  wardName: string;
  status: "active" | "inactive" | "draft";
  categories: string[];
  skus: ProductSKU[];
  attributes: ProductAttribute[];
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetManyProductResponseDto {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetProductResponseDto {
  data: Product;
}

export interface CreateProductBodyDto {
  name: string;
  basePrice: number;
  virtualPrice: number;
  brandId: string;
  images: string[];
  variants: ProductVariant[];
  description: string;
  sizeGuide?: string;
  provinceId: string;
  provinceName: string;
  districtId: string;
  districtName: string;
  wardId: string;
  wardName: string;
  status: "ACTIVE" | "INACTIVE" | "BANNED" | "DRAFT";
  categories: string[];
  skus: ProductSKU[];
  attributes: ProductAttribute[];
  updatedById?: string;
}

export interface UpdateProductBodyDto extends Partial<CreateProductBodyDto> {
  id: string;
}

// ============================================
// ORDER DTOs
// ============================================

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  thumbnail: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalPrice: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetManyOrdersResponseDto {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetOrderResponseDto {
  data: Order;
}

export interface UpdateOrderStatusBodyDto {
  status: Order["status"];
}

// ============================================
// NOTIFICATION DTOs
// ============================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface GetManyNotificationResponseDto {
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
  };
}

export interface ReadNotificationBodyDto {
  notificationId: string;
}

// ============================================
// CHAT DTOs
// ============================================

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: "seller" | "user" | "admin";
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetManyConversationResponseDto {
  data: Conversation[];
  meta: {
    total: number;
  };
}

export interface ConversationResponseDto {
  data: Conversation;
}

export interface CreateConversationBodyDto {
  participantIds: string[];
  initialMessage?: string;
}

export interface MessageResponseDto {
  data: Message;
}

export interface SendMessageBodyDto {
  conversationId: string;
  content: string;
}

// ============================================
// MEDIA (VIDEO) DTOs
// ============================================

export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
  status: "processing" | "ready" | "failed";
  title: string;
  description?: string;
  createdAt: string;
}

export interface GetManyVideoResponseDto {
  data: Video[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetVideoResponseDto {
  data: Video;
}

// ============================================
// REVIEW DTOs
// ============================================

export interface Reply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  avatar?: string;
  rating: number;
  content: string;
  status: "pending" | "approved" | "rejected";
  reply?: Reply;
  createdAt: string;
  updatedAt: string;
}

export interface GetManyProductReviewResponseDto {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ReviewResponseDto {
  data: Review;
}

export interface CreateReplyBodyDto {
  reviewId: string;
  content: string;
}

export interface UpdateReplyBodyDto {
  replyId: string;
  content: string;
}
