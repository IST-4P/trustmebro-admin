# 🚀 Quick Start Guide

Hướng dẫn nhanh để setup và chạy Seller Dashboard.

## ⚡ 5-Minute Setup

### 1. Install Dependencies (1 phút)

```bash
npm install
```

### 2. Configure Environment (1 phút)

File `.env` đã được tạo tự động từ `.env.example`. Kiểm tra và update nếu cần:

```bash
# View current config
cat .env
```

Mặc định sẽ sử dụng các API endpoints:

- Seller API: `http://trustmebro-seller.hacmieu.xyz/api/`
- User API: `http://trustmebro-user.hacmieu.xyz/api/`
- TUS Upload: `https://trustmebro-tusd.hacmieu.xyz/files/`

### 3. Start Development Server (< 1 phút)

```bash
npm run dev
```

App sẽ chạy tại: **http://localhost:5173**

### 4. Login (1 phút)

Mở browser và truy cập `http://localhost:5173`

**Demo Account** (if available):

- Email: `seller@example.com`
- Password: `password123`

Hoặc sử dụng account của bạn.

### 5. Test Video Upload (2 phút)

1. Click **Videos** trên sidebar
2. Click **Upload Video** button
3. Chọn một video file (hoặc drag & drop)
4. Nhập title và description
5. Click **Upload Video**
6. Xem progress bar và chờ upload hoàn tất

✅ Done! Bạn đã setup xong project.

---

## 🎯 Key Features Overview

### 📦 Products

- Create, edit, delete products
- Manage inventory
- Upload product images
- Set pricing and variants

**Quick Access:** `/products`

### 🛒 Orders

- View all orders
- Update order status
- Track shipments
- Manage order details

**Quick Access:** `/orders`

### 🎥 Videos

- **Upload videos với TUS** (resumable)
- Manage video library
- Track processing status
- Delete videos

**Quick Access:** `/videos`

### ⭐ Reviews

- View customer reviews
- Reply to reviews
- Manage ratings

**Quick Access:** `/reviews`

### 💬 Chat

- Real-time chat với customers
- View conversation history
- Quick replies

**Quick Access:** `/chat`

### 🔔 Notifications

- Order notifications
- Review alerts
- System messages

**Quick Access:** `/notifications`

### 📊 Dashboard

- Sales overview
- Revenue charts
- Order statistics
- Quick actions

**Quick Access:** `/`

---

## 🔧 Common Tasks

### Upload a Video

```typescript
// Navigate to Videos page
window.location.href = "/videos";

// Click "Upload Video" button
// Select video file
// Enter title & description
// Click "Upload"
```

### Create a Product

```typescript
// Navigate to Products page
window.location.href = "/products";

// Click "Add Product" button
// Fill in product details
// Upload images
// Set price & inventory
// Click "Save"
```

### Update Order Status

```typescript
// Navigate to Orders page
window.location.href = "/orders";

// Click on an order
// Change status in dropdown
// Add notes (optional)
// Click "Update"
```

---

## 🎨 UI Customization

### Toggle Dark Mode

Click moon/sun icon in header to switch between light/dark mode.

### Sidebar Navigation

- **Collapsed:** Click hamburger menu
- **Expanded:** Click hamburger menu again

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Dev Server Won't Start

```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <PID> /F

# Start again
npm run dev
```

### Video Upload Fails

1. **Check TUS endpoint:**

   ```bash
   curl https://trustmebro-tusd.hacmieu.xyz/files/
   ```

2. **Verify .env file:**

   ```bash
   cat .env | grep TUS
   ```

3. **Check browser console** for CORS errors

4. **Verify file size** < 500MB

### Can't Login

1. **Check API endpoint** trong .env
2. **Verify credentials** với backend team
3. **Check browser console** for API errors
4. **Clear browser cache** và cookies

---

## 📚 Learn More

- [Full Documentation](README.md)
- [Video Upload Guide](VIDEO_UPLOAD_GUIDE.md)
- [API Integration](src/API_INTEGRATION_GUIDE.md)
- [Authentication](src/AUTH_README.md)
- [Changelog](CHANGELOG.md)

---

## 🆘 Need Help?

1. Check [GitHub Issues](https://github.com/your-repo/issues)
2. Read [Documentation](README.md)
3. Contact team: support@trustmebro.xyz

---

## ✨ Pro Tips

1. **Use Mock Mode** khi develop UI:
   - Set `USE_MOCK_DATA = true` trong `src/services/api.ts`
   - Không cần backend connection

2. **Hot Reload:**
   - Vite tự động reload khi save files
   - Nhanh và ổn định

3. **TypeScript:**
   - Hover over code để xem types
   - Ctrl+Click để jump to definition
   - Type safety giúp catch bugs sớm

4. **Dark Mode:**
   - System sẽ remember preference
   - Stored in localStorage

5. **Keyboard Shortcuts:**
   - `Ctrl+S`: Save file
   - `Ctrl+P`: Quick file search
   - `Ctrl+Shift+P`: Command palette

---

**Happy coding! 🎉**
