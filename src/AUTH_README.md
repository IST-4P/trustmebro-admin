# Authentication Guide

## Overview

The Seller Dashboard now includes a complete authentication flow with Login, Forgot Password, and user session management.

## Features

### 1. Login Page (`/login`)
- **Email/Password authentication** with form validation
- **Show/Hide password** toggle
- **Remember me** checkbox
- **Quick Demo Login** button for testing
- **Forgot Password** link
- **Social login** buttons (Google, GitHub) - UI only
- **Demo credentials**: 
  - Email: `demo@seller.com`
  - Password: any password

### 2. Forgot Password Page (`/forgot-password`)
- Email input for password reset
- Success state with resend option
- Back to login link

### 3. Shop Page (`/shop`)
- Customer-facing product catalog
- Product grid/list view toggle
- Search functionality
- Add to cart
- Accessible without authentication
- Back to Dashboard link for sellers

### 4. Protected Routes
All seller dashboard routes require authentication:
- Dashboard
- Products
- Orders
- Notifications
- Chat
- Videos
- Reviews
- Reports

### 5. User Session
- User email displayed in header
- Logout button with confirmation dialog
- Session persists in localStorage
- Logout clears all session data

## Usage

### Testing Authentication Flow

1. **First Visit**: You'll be redirected to `/login`
2. **Login Options**:
   - Click "Quick Demo Login" for instant access
   - Or enter any email/password manually
3. **Logged In**: Access full seller dashboard
4. **Shop**: Click "Shop" button in header to view customer interface
5. **Logout**: Click logout icon → Confirm → Redirected to login

### Development Notes

- Authentication state stored in `localStorage`
- Mock authentication (no real API calls)
- Protected routes automatically redirect to login
- Auth utilities in `/utils/auth.ts`

### Auto-Login for Development

To enable auto-login (skip login page), edit `/utils/auth.ts`:

```typescript
export function initDemoAuth(): void {
  // Uncomment to enable auto-login
  if (!isAuthenticated()) {
    setAuthenticated('demo@seller.com', false);
  }
}
```

Then call `initDemoAuth()` in `/App.tsx`.

## File Structure

```
/pages/
  Login.tsx           - Login page
  ForgotPassword.tsx  - Password reset page
  Shop.tsx           - Customer shop view
/utils/
  auth.ts            - Authentication utilities
/components/
  Layout.tsx         - Updated with Shop button & user info
/App.tsx             - Routing with protected routes
```

## Customization

### Change Demo Credentials
Edit `/pages/Login.tsx`:
```typescript
const handleQuickDemo = () => {
  setEmail('your-email@example.com');
  setPassword('your-password');
  // ...
};
```

### Add Real Authentication
Replace mock auth in `/pages/Login.tsx`:
```typescript
// Replace setTimeout with real API call
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const data = await response.json();
setAuthenticated(data.email, rememberMe);
```

## Security Notes

⚠️ **This is a demo implementation**:
- No real password validation
- No secure token storage
- No server-side session management
- Not suitable for production without proper backend integration

For production:
- Implement JWT tokens
- Use httpOnly cookies
- Add CSRF protection
- Implement proper password hashing
- Add rate limiting
- Use secure session management
