# Seller Dashboard Web Application

A comprehensive, production-ready Seller Dashboard for e-commerce platforms built with React, TypeScript, and Tailwind CSS.

## Features

### 📊 **Dashboard**
- KPI cards (Total Products, Orders, Pending Orders, Revenue)
- Recent orders table
- Recent reviews preview
- Real-time metrics

### 📦 **Products Management**
- Complete CRUD operations
- Advanced filtering (status, keyword search)
- Complex product forms with:
  - Variants management
  - SKUs configuration
  - Attributes with multiple values
  - Image gallery
  - Location information (province, district, ward)
  - Brand association
  - Category tagging
- Pagination support

### 🛒 **Orders Management**
- Order list with filtering
- Order detail modal
- Status management (CREATING, PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED, REFUNDED)
- Customer information
- Order items breakdown
- Payment information

### 🔔 **Notifications**
- Real-time notifications via SSE (Server-Sent Events)
- Unread badge indicators
- Mark as read functionality
- Delete notifications
- Live connection status

### 💬 **Chat**
- Real-time messaging via SSE
- Conversation list with unread counts
- Message history
- Send/receive messages
- Live connection indicator

### 🎥 **Video Management**
- Video library grid
- Status filtering (UPLOADING, UPLOADED, PROCESSING, READY, FAILED, DELETED)
- Video player modal
- Duration display
- Thumbnail previews
- Metadata display

### ⭐ **Reviews Management**
- Product review listings
- Star rating display
- Reply to reviews
- Edit/delete replies
- Review images display

### 🚨 **Reports**
- Create reports for violations
- Multiple target types (PRODUCT, REVIEW, USER, ORDER)
- Category selection (SPAM, INAPPROPRIATE, SCAM, COPYRIGHT, OTHER)
- Report result tracking
- Status monitoring

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## API Integration

The application is designed to integrate seamlessly with your backend REST API. All endpoints follow the structure:

```
Base URL: /api/v1

Endpoints:
- GET    /dashboard
- GET    /product
- POST   /product
- PUT    /product
- DELETE /product/{id}
- GET    /order
- PUT    /order
- DELETE /order/{orderId}
- GET    /notification
- PUT    /notification
- DELETE /notification/{id}
- GET    /notification/sse (Server-Sent Events)
- GET    /chat/message
- GET    /chat/conversation
- POST   /chat/conversation
- GET    /chat/conversation/sse (Server-Sent Events)
- GET    /video
- GET    /video/{id}
- GET    /review
- POST   /reply
- PUT    /reply
- DELETE /reply/{id}
- POST   /report
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your backend API URL:

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 2. Authentication

The API service is configured to send credentials with every request using `credentials: 'include'`. This allows cookies to be sent for authentication.

Update the API service in `/services/api.ts` to add your authentication token if using Bearer tokens:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${yourToken}`,
  ...options?.headers,
},
```

### 3. Backend Requirements

Your backend must support:

1. **CORS Configuration**: Allow credentials and the frontend origin
2. **DTO Schemas**: Match the TypeScript interfaces in `/types/index.ts`
3. **SSE Support**: Server-Sent Events for `/notification/sse` and `/chat/conversation/sse`
4. **Pagination**: Return data in the format:
   ```typescript
   {
     data: T[],
     total: number,
     page: number,
     limit: number,
     totalPages: number
   }
   ```

## Project Structure

```
/
├── components/
│   └── Layout.tsx              # Main layout with sidebar and header
├── pages/
│   ├── Dashboard.tsx           # Dashboard with KPIs
│   ├── Products.tsx            # Product list
│   ├── ProductForm.tsx         # Create/Edit product
│   ├── Orders.tsx              # Order management
│   ├── Notifications.tsx       # Notifications with SSE
│   ├── Chat.tsx                # Chat with SSE
│   ├── Videos.tsx              # Video library
│   ├── Reviews.tsx             # Review management
│   └── Reports.tsx             # Create reports
├── services/
│   └── api.ts                  # API service layer
├── types/
│   └── index.ts                # TypeScript DTOs and interfaces
└── App.tsx                     # Main app with routing
```

## Type Safety

All API DTOs are strictly typed to match your backend schemas. Key interfaces:

- `GetAllProductResponseDto` - Product data structure
- `CreateProductDto` - Product creation payload
- `UpdateProductDto` - Product update payload
- `GetAllOrderResponseDto` - Order data structure
- `GetAllNotificationResponseDto` - Notification structure
- `ChatMessage` & `ChatConversation` - Chat structures
- `GetAllVideoResponseDto` - Video structure
- `GetAllReviewResponseDto` - Review structure
- `CreateReportDto` - Report creation payload

## Real-time Features

### Server-Sent Events (SSE)

The application uses SSE for real-time updates:

**Notifications:**
```typescript
const eventSource = notificationApi.subscribeSSE((notification) => {
  // Handle new notification
});
```

**Chat:**
```typescript
const eventSource = chatApi.subscribeSSE((message) => {
  // Handle new message
});
```

SSE connections are automatically cleaned up when components unmount.

## Styling

The application uses Tailwind CSS v4 with:
- Dark mode support (dark: prefix classes)
- Responsive design (mobile-first)
- Custom color schemes
- Smooth transitions and animations

## Development Notes

### Adding New Features

1. **Add Types**: Define DTOs in `/types/index.ts`
2. **Create API Methods**: Add endpoints in `/services/api.ts`
3. **Build UI**: Create components/pages
4. **Add Routes**: Update `/App.tsx` routing

### Error Handling

API calls include basic error handling. Enhance as needed:

```typescript
try {
  const data = await productApi.getAll();
  // Handle success
} catch (error) {
  console.error('Failed to load products:', error);
  // Show user-friendly error message
}
```

### Loading States

All list pages include loading states with spinners and skeleton screens.

## Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Set `VITE_API_BASE_URL` to your production API:

```
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### Performance Optimization

- Lazy load routes if needed
- Implement virtual scrolling for large lists
- Add caching layer (React Query/SWR)
- Optimize images
- Enable compression

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - All rights reserved

## Support

For backend API integration support, refer to your backend API documentation and ensure all DTO schemas match the TypeScript interfaces defined in this application.
