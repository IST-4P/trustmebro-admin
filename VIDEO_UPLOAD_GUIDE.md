# Video Upload Guide

Hướng dẫn chi tiết về tính năng upload video với TUS protocol trong Seller Dashboard.

## 📋 Tổng quan

Tính năng upload video sử dụng **TUS protocol** (https://tus.io/) - một giao thức mở cho resumable file uploads. Điều này cho phép:

- ✅ Tiếp tục upload khi kết nối bị gián đoạn
- ✅ Upload file lớn một cách hiệu quả
- ✅ Theo dõi tiến trình upload real-time
- ✅ Tự động retry khi có lỗi

## 🏗 Kiến trúc

### Components

1. **VideoUploadModal** (`src/components/VideoUploadModal.tsx`)
   - Modal component cho upload video
   - Xử lý file selection, preview, và form input
   - Gọi API upload và hiển thị progress

2. **Videos Page** (`src/pages/Videos.tsx`)
   - Trang quản lý video
   - Hiển thị danh sách video
   - Trigger upload modal
   - Auto-refresh khi có video đang processing

3. **Video API** (`src/services/api.ts`)
   - `videoApi.upload()` - Upload video với TUS protocol
   - `videoApi.getAll()` - Lấy danh sách video
   - `videoApi.delete()` - Xóa video

## 🔧 Cấu hình

### Environment Variables

```env
# TUS Server Endpoint
VITE_TUS_ENDPOINT=https://trustmebro-tusd.hacmieu.xyz/files/

# Hoặc sử dụng VITE_UPLOAD_URL (fallback)
VITE_UPLOAD_URL=https://trustmebro-tusd.hacmieu.xyz/files/
```

### Video Upload Settings

```typescript
// Max file size: 500MB
const maxSize = 500 * 1024 * 1024;

// Accepted formats: video/*
accept = "video/*";

// TUS retry delays: 0ms, 1s, 3s, 5s
retryDelays: [0, 1000, 3000, 5000];
```

## 📝 Workflow Upload

### 1. User Actions

```
User clicks "Upload Video"
  ↓
Select/drag video file
  ↓
Enter title & description
  ↓
Click "Upload Video"
```

### 2. Upload Process

```javascript
// 1. Initialize TUS upload
const upload = new Upload(file, {
  endpoint: VITE_TUS_ENDPOINT,
  metadata: {
    filename: file.name,
    filetype: file.type,
    title: title,
    description: description,
  },
  onBeforeRequest: (req) => {
    // Enable credentials for authentication
    req.getUnderlyingObject().withCredentials = true;
  },
  onProgress: (uploaded, total) => {
    // Update progress bar
    const progress = (uploaded / total) * 100;
    onProgress(progress);
  },
  onSuccess: () => {
    // Upload complete
    console.log("Upload done!", upload.url);
  },
  onError: (error) => {
    // Handle error
    console.error("Upload failed:", error);
  },
});

// 2. Start upload
upload.start();
```

### 3. Server Processing

```
Upload complete → UPLOADED status
  ↓
Server processes video → PROCESSING status
  ↓
Video ready → READY status
```

## 🔄 Video Status Flow

```typescript
type VideoStatus =
  | "UPLOADING" // Đang upload
  | "UPLOADED" // Upload xong, chờ xử lý
  | "PROCESSING" // Đang xử lý video
  | "READY" // Sẵn sàng để xem
  | "FAILED" // Xử lý thất bại
  | "DELETED"; // Đã xóa
```

## 📊 API Response

### Upload Response

```typescript
interface GetAllVideoResponseDto {
  id: string;
  title: string;
  description?: string;
  url: string; // TUS upload URL
  thumbnailUrl?: string;
  duration?: number; // Video duration in seconds
  status: VideoStatus;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🎯 Features

### 1. File Validation

```typescript
// Validate file type
if (!file.type.startsWith("video/")) {
  setError("Please select a valid video file");
  return false;
}

// Validate file size (max 500MB)
const maxSize = 500 * 1024 * 1024;
if (file.size > maxSize) {
  setError("File size must be less than 500MB");
  return false;
}
```

### 2. Drag & Drop

```typescript
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) {
    validateAndSetFile(file);
  }
};
```

### 3. Video Preview

```typescript
// Create preview URL
const url = URL.createObjectURL(file);
setPreviewUrl(url);

// Clean up when done
URL.revokeObjectURL(previewUrl);
```

### 4. Progress Tracking

```typescript
onProgress: (uploaded, total) => {
  const progress = Math.floor((uploaded / total) * 100);
  setUploadProgress(progress);
};
```

### 5. Error Handling

```typescript
onError: (error) => {
  console.error("Upload error:", error);
  setError(error.message || "Upload failed");
};
```

### 6. Auto Retry

```typescript
// TUS client tự động retry với delays
retryDelays: [0, 1000, 3000, 5000];
```

## 🔐 Authentication

Upload requests include credentials:

```typescript
onBeforeRequest: function (req) {
  const xhr = req.getUnderlyingObject();
  xhr.withCredentials = true; // Send cookies
}
```

Backend cần:

- Xác thực user từ cookies/session
- Validate upload permissions
- Link video với seller account

## 🐛 Troubleshooting

### Upload fails immediately

**Nguyên nhân:**

- TUS endpoint không đúng
- CORS issues
- Network connectivity

**Giải pháp:**

```bash
# Check environment variables
cat .env

# Verify TUS endpoint
curl https://trustmebro-tusd.hacmieu.xyz/files/

# Check browser console for CORS errors
```

### Upload stuck at certain percentage

**Nguyên nhân:**

- Network interruption
- Server timeout
- File too large

**Giải pháp:**

- TUS sẽ tự động retry
- Kiểm tra file size < 500MB
- Check network stability

### Video stays in PROCESSING status

**Nguyên nhân:**

- Backend video processing chậm
- Processing error

**Giải pháp:**

- Wait và auto-refresh sẽ update status
- Check backend logs
- Contact backend team

## 📱 Testing

### Manual Testing

1. Upload file nhỏ (< 10MB):
   - Verify upload thành công
   - Check progress bar
   - Verify status transitions

2. Upload file lớn (> 100MB):
   - Test resumable upload
   - Disconnect network mid-upload
   - Reconnect và verify continue

3. Error scenarios:
   - Wrong file type
   - File too large
   - Network errors

### Mock Mode Testing

```typescript
// Enable mock mode in api.ts
const USE_MOCK_DATA = true;

// Mock automatically simulates:
// - Upload progress
// - Status transitions
// - Success/error scenarios
```

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] TUS server deployed and accessible
- [ ] CORS configured on TUS server
- [ ] Authentication working
- [ ] File size limits enforced
- [ ] Video processing pipeline ready
- [ ] Error monitoring setup
- [ ] Backup strategy for uploaded videos

## 📚 Resources

- [TUS Protocol](https://tus.io/)
- [tus-js-client Documentation](https://github.com/tus/tus-js-client)
- [TUS Server (tusd)](https://github.com/tus/tusd)

## 💡 Best Practices

1. **Always validate files client-side** trước khi upload
2. **Show clear progress feedback** để user biết upload đang diễn ra
3. **Handle errors gracefully** với retry options
4. **Clean up resources** (preview URLs, upload instances)
5. **Auto-refresh video list** để show processing status
6. **Log errors** cho debugging
7. **Test với các network conditions** khác nhau

## 🔮 Future Improvements

- [ ] Multiple file upload
- [ ] Upload queue management
- [ ] Thumbnail generation client-side
- [ ] Video trimming/editing trước upload
- [ ] Upload from URL
- [ ] Mobile app support
- [ ] Video compression options
- [ ] Upload scheduling
