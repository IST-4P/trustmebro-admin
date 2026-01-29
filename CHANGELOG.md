# Changelog

All notable changes to the Seller Dashboard project will be documented in this file.

## [0.2.0] - 2026-01-24

### Added

- ✨ **TUS Video Upload** - Resumable video uploads với TUS protocol
  - Upload file video lớn (max 500MB)
  - Progress tracking real-time
  - Auto retry khi có lỗi
  - Resume upload khi bị gián đoạn
  - Credentials support cho authentication

- 📝 **Documentation**
  - Added comprehensive VIDEO_UPLOAD_GUIDE.md
  - Updated README.md với detailed instructions
  - Added API integration examples

- 🎨 **UI Components**
  - Enhanced VideoUploadModal với drag & drop
  - Video preview trước upload
  - Upload progress bar với animation
  - Success/error states
  - File validation feedback

- 🔧 **Configuration**
  - Added .env.example với TUS endpoint
  - Created .gitignore
  - Added TypeScript configurations
  - Added Tailwind CSS configuration
  - Added PostCSS configuration

- 📦 **Dependencies**
  - Added tus-js-client@^4.3.1
  - Added react-router-dom
  - Added TypeScript types
  - Added Tailwind CSS với PostCSS

- 🎯 **Constants & Types**
  - Created src/constants.ts với app-wide constants
  - Video upload constants
  - Pagination settings
  - Status enums
  - Routes constants

### Changed

- 🔄 Updated videoApi.upload() để sử dụng TUS protocol
- 📱 Enhanced Videos page với auto-refresh cho processing videos
- 🎨 Improved VideoUploadModal UX
- 📄 Updated index.html title và meta tags

### Fixed

- 🐛 Fixed TypeScript deprecation warnings
- 🐛 Fixed module type warnings
- ✅ All TypeScript errors resolved

### Technical Details

#### Video Upload Implementation

```typescript
// TUS Client Integration
import { Upload } from "tus-js-client";

const upload = new Upload(file, {
  endpoint: VITE_TUS_ENDPOINT,
  metadata: { filename, filetype, title, description },
  onProgress: (uploaded, total) => {
    /* track progress */
  },
  onSuccess: () => {
    /* upload complete */
  },
  onError: (error) => {
    /* handle error */
  },
  retryDelays: [0, 1000, 3000, 5000],
});
```

#### Environment Variables

- `VITE_TUS_ENDPOINT` - TUS server endpoint for video uploads
- `VITE_SELLER_URL` - Seller API URL
- `VITE_USER_URL` - User API URL

#### File Structure Updates

```
Seller/
├── src/
│   ├── constants.ts (NEW)
│   ├── styles/
│   │   └── UploadVideo.css (NEW)
│   └── ...
├── .env (NEW)
├── .env.example (UPDATED)
├── .gitignore (NEW)
├── tsconfig.json (NEW)
├── tsconfig.node.json (NEW)
├── tailwind.config.js (NEW)
├── postcss.config.js (NEW)
├── VIDEO_UPLOAD_GUIDE.md (NEW)
└── CHANGELOG.md (NEW)
```

## [0.1.0] - Initial Release

### Features

- 📦 Product management
- 🛒 Order management
- 💬 Chat system
- 📊 Dashboard & Analytics
- ⭐ Review management
- 🔔 Notifications
- 🌙 Dark mode support

---

## Version Guidelines

- **Major version (X.0.0)**: Breaking changes
- **Minor version (0.X.0)**: New features, backward compatible
- **Patch version (0.0.X)**: Bug fixes, backward compatible

## Unreleased

### Planned Features

- [ ] Multiple file upload
- [ ] Video trimming/editing
- [ ] Upload queue management
- [ ] Thumbnail generation client-side
- [ ] Upload from URL
- [ ] Mobile app support
- [ ] Video compression options
- [ ] Upload scheduling
