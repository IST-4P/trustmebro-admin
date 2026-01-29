# API Integration Guide

This document provides detailed information for integrating the Seller Dashboard frontend with your backend API.

## Authentication

### Cookie-Based Authentication (Default)

The API service is configured to use cookie-based authentication:

```typescript
credentials: 'include' // Sends cookies with every request
```

Your backend should:
1. Set HTTP-only cookies on login
2. Validate cookies on protected routes
3. Return 401 for unauthorized requests

### Token-Based Authentication (Alternative)

To use Bearer token authentication, modify `/services/api.ts`:

```typescript
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('authToken'); // or from your auth context
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  
  // ... rest of the function
}
```

## CORS Configuration

Your backend must allow:

```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## API Endpoints Reference

### Dashboard

**GET /api/v1/dashboard**

Response:
```json
{
  "totalProducts": 150,
  "totalOrders": 423,
  "pendingOrders": 12,
  "revenue": 45230.50
}
```

### Products

**GET /api/v1/product**

Query Parameters:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): ACTIVE | INACTIVE | DRAFT
- `keyword` (string, optional): Search term
- `sortBy` (string, optional): Field to sort by
- `sortOrder` (string, optional): asc | desc

Response:
```json
{
  "data": [
    {
      "id": "product-123",
      "name": "Product Name",
      "basePrice": 99.99,
      "virtualPrice": 89.99,
      "status": "ACTIVE",
      "images": ["url1", "url2"],
      "brandId": "brand-456",
      "brandName": "Brand Name",
      "description": "Product description",
      "sizeGuide": "Size guide text",
      "provinceId": "province-1",
      "provinceName": "Province Name",
      "districtId": "district-1",
      "districtName": "District Name",
      "wardId": "ward-1",
      "wardName": "Ward Name",
      "variants": [
        {
          "id": "variant-1",
          "name": "Size M",
          "price": 99.99,
          "stock": 50,
          "sku": "SKU-123"
        }
      ],
      "categories": ["category-1", "category-2"],
      "skus": [
        {
          "id": "sku-1",
          "sku": "SKU-123",
          "price": 99.99,
          "stock": 50,
          "attributes": {
            "size": "M",
            "color": "Blue"
          }
        }
      ],
      "attributes": [
        {
          "name": "Color",
          "values": ["Red", "Blue", "Green"]
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedById": "user-789"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

**GET /api/v1/product/{id}**

Returns single product with same structure as above.

**POST /api/v1/product**

Request Body:
```json
{
  "name": "Product Name",
  "basePrice": 99.99,
  "virtualPrice": 89.99,
  "brandId": "brand-456",
  "images": ["url1", "url2"],
  "variants": [...],
  "description": "Product description",
  "sizeGuide": "Size guide",
  "provinceId": "province-1",
  "provinceName": "Province Name",
  "districtId": "district-1",
  "districtName": "District Name",
  "wardId": "ward-1",
  "wardName": "Ward Name",
  "status": "ACTIVE",
  "categories": ["category-1"],
  "skus": [...],
  "attributes": [...]
}
```

Response: Returns created product object.

**PUT /api/v1/product**

Request Body (same as POST with added id):
```json
{
  "id": "product-123",
  "name": "Updated Product Name",
  ...
}
```

Response: Returns updated product object.

**DELETE /api/v1/product/{id}**

Response:
```json
{
  "success": true
}
```

### Orders

**GET /api/v1/order**

Query Parameters:
- `page`, `limit` (pagination)
- `paymentId` (string, optional)
- `code` (string, optional): Order code search
- `status` (string, optional): CREATING | PENDING | CONFIRMED | SHIPPING | COMPLETED | CANCELLED | REFUNDED
- `userId` (string, optional)
- `sortBy`, `sortOrder` (sorting)

Response:
```json
{
  "data": [
    {
      "id": "order-123",
      "code": "ORD-2024-001",
      "paymentId": "payment-456",
      "userId": "user-789",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "totalPrice": 199.98,
      "status": "PENDING",
      "items": [
        {
          "id": "item-1",
          "productId": "product-123",
          "productName": "Product Name",
          "variantId": "variant-1",
          "variantName": "Size M",
          "quantity": 2,
          "price": 99.99,
          "totalPrice": 199.98
        }
      ],
      "shippingAddress": "123 Main St, City",
      "notes": "Please deliver in the morning",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 423,
  "page": 1,
  "limit": 10,
  "totalPages": 43
}
```

**GET /api/v1/order/{orderId}**

Returns single order with same structure.

**PUT /api/v1/order**

Request Body:
```json
{
  "id": "order-123",
  "status": "CONFIRMED",
  "notes": "Optional notes"
}
```

Response: Returns updated order object.

**DELETE /api/v1/order/{orderId}**

Response:
```json
{
  "success": true
}
```

### Notifications

**GET /api/v1/notification**

Query Parameters:
- `page`, `limit` (pagination)

Response:
```json
{
  "data": [
    {
      "id": "notif-123",
      "title": "New Order",
      "content": "You have a new order #ORD-2024-001",
      "type": "order",
      "isRead": false,
      "link": "/orders/order-123",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

**PUT /api/v1/notification**

Request Body:
```json
{
  "id": "notif-123",
  "isRead": true
}
```

Response: Returns updated notification object.

**DELETE /api/v1/notification/{id}**

Response:
```json
{
  "success": true
}
```

**GET /api/v1/notification/sse**

Server-Sent Events endpoint. Sends real-time notifications:

```
event: message
data: {"id":"notif-456","title":"New Order","content":"...","type":"order","isRead":false,"createdAt":"2024-01-01T00:00:00.000Z"}
```

Implementation example (Node.js/Express):
```javascript
app.get('/api/v1/notification/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send notification when available
  const sendNotification = (notification) => {
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  };
  
  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(':keep-alive\n\n');
  }, 30000);
  
  req.on('close', () => {
    clearInterval(keepAlive);
  });
});
```

### Chat

**GET /api/v1/chat/conversation**

Query Parameters:
- `page`, `limit` (pagination)

Response:
```json
{
  "data": [
    {
      "id": "conv-123",
      "participants": ["user-1", "user-2"],
      "participantNames": ["John Doe", "Seller"],
      "lastMessage": {
        "id": "msg-456",
        "conversationId": "conv-123",
        "senderId": "user-1",
        "senderName": "John Doe",
        "content": "Hello",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isRead": true
      },
      "unreadCount": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

**GET /api/v1/chat/message**

Query Parameters:
- `conversationId` (string, required)
- `page`, `limit` (pagination)

Response:
```json
{
  "data": [
    {
      "id": "msg-123",
      "conversationId": "conv-123",
      "senderId": "user-1",
      "senderName": "John Doe",
      "content": "Hello, I have a question",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isRead": true
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 100,
  "totalPages": 1
}
```

**POST /api/v1/chat/conversation**

Request Body:
```json
{
  "participantId": "user-123",
  "initialMessage": "Hello"
}
```

Response: Returns created conversation object.

**GET /api/v1/chat/conversation/sse**

Server-Sent Events for real-time chat messages. Same SSE pattern as notifications.

### Videos

**GET /api/v1/video**

Query Parameters:
- `page`, `limit` (pagination)
- `status` (string, optional): UPLOADING | UPLOADED | PROCESSING | READY | FAILED | DELETED
- `title` (string, optional): Search by title
- `sortBy`, `sortOrder` (sorting)

Response:
```json
{
  "data": [
    {
      "id": "video-123",
      "title": "Product Demo Video",
      "description": "Video description",
      "url": "https://video-url.com/video.mp4",
      "thumbnailUrl": "https://video-url.com/thumb.jpg",
      "duration": 120,
      "status": "READY",
      "uploadedBy": "seller-456",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 12,
  "totalPages": 5
}
```

**GET /api/v1/video/{id}**

Returns single video with same structure.

### Reviews

**GET /api/v1/review**

Query Parameters:
- `page`, `limit` (pagination)
- `productId` (string, optional)
- `rating` (number, optional): Filter by rating
- `sortBy`, `sortOrder` (sorting)

Response:
```json
{
  "data": [
    {
      "id": "review-123",
      "productId": "product-456",
      "productName": "Product Name",
      "userId": "user-789",
      "userName": "John Doe",
      "rating": 5,
      "content": "Great product!",
      "images": ["url1", "url2"],
      "status": "published",
      "reply": {
        "id": "reply-123",
        "content": "Thank you for your feedback!",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 200,
  "page": 1,
  "limit": 10,
  "totalPages": 20
}
```

**POST /api/v1/reply**

Request Body:
```json
{
  "reviewId": "review-123",
  "content": "Thank you for your feedback!"
}
```

Response: Returns updated review object with reply.

**PUT /api/v1/reply**

Request Body:
```json
{
  "id": "reply-123",
  "content": "Updated reply content"
}
```

Response: Returns updated review object with reply.

**DELETE /api/v1/reply/{id}**

Response:
```json
{
  "success": true
}
```

### Reports

**POST /api/v1/report**

Request Body:
```json
{
  "targetId": "product-123",
  "targetType": "PRODUCT",
  "category": "SPAM",
  "title": "Spam Product",
  "description": "This product appears to be spam"
}
```

Response:
```json
{
  "id": "report-123",
  "reporterId": "seller-456",
  "reporterName": "Seller Name",
  "targetId": "product-123",
  "targetType": "PRODUCT",
  "category": "SPAM",
  "title": "Spam Product",
  "description": "This product appears to be spam",
  "status": "PENDING",
  "note": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

All endpoints should return errors in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing the Integration

1. **Start your backend server**
2. **Update `.env` file** with your API URL
3. **Test each endpoint** using the dashboard
4. **Monitor network tab** in browser DevTools
5. **Check SSE connections** work for notifications and chat

## Common Issues

### CORS Errors
- Ensure your backend allows the frontend origin
- Enable credentials in CORS config

### SSE Not Working
- Check that SSE endpoint returns correct headers
- Ensure connection stays open
- Verify data format is correct

### Authentication Issues
- Verify cookies are being set
- Check token expiration
- Ensure credentials are included

### Type Mismatches
- Verify backend DTOs match TypeScript interfaces
- Check field names are exact matches
- Ensure enum values match

## Support

For integration issues:
1. Check browser console for errors
2. Inspect network requests in DevTools
3. Verify backend logs
4. Ensure DTO schemas match exactly
