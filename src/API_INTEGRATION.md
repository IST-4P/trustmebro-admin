# API Integration Guide

This guide explains how to connect the Seller Dashboard to your actual backend API.

## 🔌 Quick Start Integration

### 1. Configure Base URL

Edit `/services/api.ts`:

```typescript
// Replace this placeholder with your actual backend URL
const API_BASE_URL = 'https://your-backend-api.com/api';
// Example: 'https://api.mystore.com/v1'
```

### 2. Set Up Authentication

The application uses Bearer token authentication. After your user logs in:

```typescript
import { setAuthToken } from './services/api';

// Call this after successful login
setAuthToken(userToken);
```

The token will automatically be included in all API requests:
```
Authorization: Bearer <your-token>
```

## 🔄 Replacing Mock Data

Each component has sections marked with `TODO` comments. Follow this pattern:

### Before (Mock Data):
```typescript
// TODO: Replace with actual API call when backend is ready
// const response = await productsApi.getAll({ page: 1, limit: 10 });
// setProducts(response.data);

// Using mock data for now
await new Promise(resolve => setTimeout(resolve, 500));
setProducts(mockProductsData.data);
```

### After (Real API):
```typescript
const response = await productsApi.getAll({ page: 1, limit: 10 });
setProducts(response.data);
```

## 📡 Module-by-Module Integration

### Dashboard Module

**File**: `/components/Dashboard.tsx`

**API Calls Needed**:
```typescript
const loadDashboardData = async () => {
  try {
    setLoading(true);
    
    const [statsRes, ordersRes, reviewsRes] = await Promise.all([
      dashboardApi.getStats(),
      ordersApi.getAll({ page: 1, limit: 5 }),
      reviewsApi.getAll({ page: 1, limit: 5 }),
    ]);
    
    setStats(statsRes);
    setRecentOrders(ordersRes.data);
    setRecentReviews(reviewsRes.data);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Show error message to user
  } finally {
    setLoading(false);
  }
};
```

**Expected Response** (from `GET /seller/dashboard`):
```json
{
  "data": {
    "totalProducts": 124,
    "totalOrders": 856,
    "pendingOrders": 23,
    "revenue": 125430.50
  }
}
```

---

### Products Module

**Files**: 
- `/components/Products/ProductList.tsx`
- `/components/Products/ProductForm.tsx`

**List Products**:
```typescript
const response = await productsApi.getAll({ 
  page: currentPage, 
  limit: 10, 
  search: searchQuery 
});
setProducts(response.data);
setTotalPages(Math.ceil(response.meta.total / response.meta.limit));
```

**Create Product**:
```typescript
const response = await productsApi.create(formData);
// formData matches CreateProductBodyDto exactly
```

**Update Product**:
```typescript
const response = await productsApi.update(id, { ...formData, id });
```

**Delete Product**:
```typescript
await productsApi.delete(id);
```

**Expected DTO Structure**:
```typescript
interface CreateProductBodyDto {
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
  status: 'active' | 'inactive' | 'draft';
  categories: string[];
  skus: ProductSKU[];
  attributes: ProductAttribute[];
}
```

---

### Orders Module

**Files**:
- `/components/Orders/OrderList.tsx`
- `/components/Orders/OrderDetail.tsx`

**List Orders**:
```typescript
const response = await ordersApi.getAll({
  page: currentPage,
  limit: 10,
  status: statusFilter !== 'all' ? statusFilter : undefined,
});
```

**Get Order Details**:
```typescript
const response = await ordersApi.getById(id);
setOrder(response.data);
```

**Update Order Status**:
```typescript
const response = await ordersApi.updateStatus(order.id, { 
  status: newStatus 
});
setOrder(response.data);
```

**Status Flow**:
```
pending → confirmed → processing → shipped → delivered
                                            ↓
                                        cancelled
```

---

### Notifications Module

**File**: `/components/Notifications.tsx`

**Load Notifications**:
```typescript
const response = await notificationsApi.getAll({ page: 1, limit: 50 });
setNotifications(response.data);
```

**Mark as Read**:
```typescript
await notificationsApi.markAsRead({ notificationId });
```

**Delete Notification**:
```typescript
await notificationsApi.delete(notificationId);
```

**Real-time Updates (SSE)**:
```typescript
const connectSSE = () => {
  sseClient.connect(
    '/seller/notifications/stream',
    (event: MessageEvent) => {
      const notification = JSON.parse(event.data) as Notification;
      setNotifications(prev => [notification, ...prev]);
    },
    (error: Event) => {
      console.error('SSE connection error:', error);
      setSseConnected(false);
    }
  );
  setSseConnected(true);
};
```

**SSE Event Format**:
```json
{
  "id": "notif-123",
  "title": "New Order Received",
  "message": "Order #ORD-001 has been placed",
  "type": "success",
  "isRead": false,
  "createdAt": "2024-01-22T10:30:00Z"
}
```

---

### Chat Module

**File**: `/components/Chat.tsx`

**Load Conversations**:
```typescript
const response = await chatApi.getConversations({ page: 1, limit: 50 });
setConversations(response.data);
```

**Load Messages**:
```typescript
const response = await chatApi.getMessages(conversationId, { 
  page: 1, 
  limit: 100 
});
setMessages(response.data);
```

**Send Message**:
```typescript
const response = await chatApi.sendMessage({
  conversationId: selectedConversation.id,
  content: newMessage.trim(),
});
setMessages([...messages, response.data]);
```

**Real-time Chat (SSE)**:
```typescript
sseClient.connect(
  '/seller/chat/stream',
  (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;
    setMessages(prev => [...prev, message]);
    
    // Update conversation last message
    setConversations(prev => prev.map(c =>
      c.id === message.conversationId
        ? { ...c, lastMessage: message, unreadCount: c.unreadCount + 1 }
        : c
    ));
  }
);
```

---

### Media Module

**File**: `/components/Media.tsx`

**Load Videos**:
```typescript
const response = await mediaApi.getAll({ page: currentPage, limit: 12 });
setVideos(response.data);
```

**Delete Video**:
```typescript
await mediaApi.delete(id);
```

**Video Status**:
- `processing` - Video is being processed
- `ready` - Video is ready to play
- `failed` - Processing failed

---

### Reviews Module

**File**: `/components/Reviews.tsx`

**Load Reviews**:
```typescript
const response = await reviewsApi.getAll({ 
  page: currentPage, 
  limit: 10 
});
setReviews(response.data);
```

**Create Reply**:
```typescript
const response = await reviewsApi.createReply({
  reviewId,
  content: replyContent.trim(),
});
```

**Update Reply**:
```typescript
const response = await reviewsApi.updateReply({
  replyId,
  content: replyContent.trim(),
});
```

**Delete Reply**:
```typescript
await reviewsApi.deleteReply(replyId);
```

## 🔒 Error Handling

Implement consistent error handling across all API calls:

```typescript
try {
  const response = await productsApi.getAll();
  setProducts(response.data);
} catch (error) {
  if (error instanceof Error) {
    // Show user-friendly error message
    toast.error(error.message);
  }
  console.error('API Error:', error);
}
```

## 🚨 Common Integration Issues

### 1. CORS Errors

**Problem**: Browser blocks API requests
**Solution**: Configure your backend to allow requests from your frontend domain

```javascript
// Backend CORS configuration example
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### 2. Authentication Token Expiration

**Problem**: Token expires, API returns 401
**Solution**: Implement token refresh logic

```typescript
// Add to api.ts
const handleUnauthorized = () => {
  // Clear token and redirect to login
  setAuthToken('');
  window.location.href = '/login';
};
```

### 3. SSE Connection Issues

**Problem**: SSE connection drops or doesn't work
**Solutions**:
- Ensure backend sends proper SSE headers: `Content-Type: text/event-stream`
- Implement reconnection logic
- Check network/proxy configuration

### 4. Data Format Mismatch

**Problem**: Backend returns different field names
**Solution**: Create data adapters

```typescript
// Example adapter
const adaptProductResponse = (backendData: any): Product => ({
  id: backendData.product_id,
  name: backendData.product_name,
  // ... map all fields
});
```

## ✅ Testing Integration

### Manual Testing Checklist

- [ ] Dashboard loads with correct stats
- [ ] Products can be created, edited, deleted
- [ ] Product search works
- [ ] Orders display correctly
- [ ] Order status can be updated
- [ ] Notifications appear
- [ ] Notifications can be marked as read
- [ ] Real-time notifications work (SSE)
- [ ] Chat conversations load
- [ ] Messages can be sent
- [ ] Real-time chat works (SSE)
- [ ] Videos display correctly
- [ ] Reviews load with proper data
- [ ] Replies can be created/edited/deleted

### API Testing Tools

Use these tools to test your backend before integration:
- **Postman** - Test individual endpoints
- **cURL** - Command-line testing
- **Browser DevTools** - Network tab to inspect requests/responses

## 📞 Support

If you encounter issues during integration:

1. Check the browser console for errors
2. Verify API endpoint URLs match your backend
3. Confirm authentication token is set correctly
4. Check backend logs for errors
5. Verify CORS configuration
6. Test endpoints directly with Postman

## 🎯 Next Steps

After completing basic integration:

1. Add proper error handling and user feedback
2. Implement loading states
3. Add form validation
4. Set up proper authentication flow
5. Add retry logic for failed requests
6. Implement request caching where appropriate
7. Add request/response logging for debugging
8. Set up monitoring and analytics

---

**Remember**: All TODO comments in the code indicate where mock data should be replaced with real API calls. Search for `TODO: Replace with actual API` to find all integration points.
