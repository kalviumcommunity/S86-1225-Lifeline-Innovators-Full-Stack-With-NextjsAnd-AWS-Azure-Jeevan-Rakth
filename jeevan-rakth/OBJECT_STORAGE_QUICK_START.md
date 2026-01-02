# 🚀 Object Storage Quick Start Guide

## Get Started in 5 Minutes

### Prerequisites
- ✅ Node.js installed
- ✅ AWS Account OR Azure Account
- ✅ Next.js project running

---

## Step 1: Choose Your Provider

### Option A: AWS S3 🟠

1. **Create S3 Bucket**
   - Go to AWS Console → S3
   - Create bucket: `jeevan-rakth-storage`
   - Region: `ap-south-1`
   - Block public access: ✅ Enabled

2. **Create IAM User**
   - IAM → Users → Create `storage-uploader`
   - Attach policy with `s3:PutObject` and `s3:GetObject` permissions
   - Generate Access Keys

3. **Update `.env.local`**
   ```env
   FILE_STORAGE_PROVIDER=aws
   AWS_ACCESS_KEY_ID=your-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=ap-south-1
   AWS_BUCKET_NAME=jeevan-rakth-storage
   ```

### Option B: Azure Blob Storage 🔷

1. **Create Storage Account**
   - Azure Portal → Storage accounts → Create
   - Name: `jeevanrakthstorage`
   - Region: Central India
   - Performance: Standard

2. **Create Container**
   - Containers → Create `uploads`
   - Access level: Private

3. **Get Access Keys**
   - Access keys → Copy Key1

4. **Update `.env.local`**
   ```env
   FILE_STORAGE_PROVIDER=azure
   AZURE_STORAGE_ACCOUNT_NAME=jeevanrakthstorage
   AZURE_STORAGE_ACCOUNT_KEY=your-storage-key
   AZURE_STORAGE_CONTAINER_NAME=uploads
   ```

---

## Step 2: Test the Implementation

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Open Demo Page**
   ```
   http://localhost:3000/storage-demo
   ```

3. **Upload a Test Image**
   - Choose provider (AWS or Azure)
   - Drag & drop an image (PNG/JPEG, max 2MB)
   - Click Upload button
   - ✅ Success! File uploaded to cloud

---

## Step 3: Use in Your App

### Import the Component

```tsx
import FileUpload from '@/components/FileUpload';
```

### Add to Your Page

```tsx
<FileUpload
  provider="aws" // or "azure"
  onUploadSuccess={(url, key) => {
    console.log('File uploaded:', url);
    // Save URL to database
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
  maxSizeMB={2}
  allowedTypes={['image/png', 'image/jpeg']}
/>
```

---

## API Endpoints

### AWS S3 Presigned URL
```
GET /api/storage/s3-upload-url?fileName=photo.jpg&fileType=image/jpeg&fileSize=150000
```

### Azure Blob SAS URL
```
GET /api/storage/azure-upload-url?fileName=photo.jpg&fileType=image/jpeg&fileSize=150000
```

---

## Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FILE_STORAGE_PROVIDER` | Yes | `aws` | `aws` or `azure` |
| `FILE_UPLOAD_URL_TTL_SECONDS` | No | `60` | URL expiration time |
| `FILE_UPLOAD_MAX_BYTES` | No | `2097152` | Max file size (2MB) |
| `ALLOWED_FILE_TYPES` | No | `image/png,image/jpeg` | Allowed MIME types |

### AWS S3 Variables

| Variable | Required | Example |
|----------|----------|---------|
| `AWS_ACCESS_KEY_ID` | Yes | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Yes | `wJalrXUtnFEMI/K7MDENG/...` |
| `AWS_REGION` | Yes | `ap-south-1` |
| `AWS_BUCKET_NAME` | Yes | `jeevan-rakth-storage` |

### Azure Blob Variables

| Variable | Required | Example |
|----------|----------|---------|
| `AZURE_STORAGE_ACCOUNT_NAME` | Yes | `jeevanrakthstorage` |
| `AZURE_STORAGE_ACCOUNT_KEY` | Yes | `base64-encoded-key` |
| `AZURE_STORAGE_CONTAINER_NAME` | Yes | `uploads` |

---

## Common Issues & Solutions

### ❌ "Server configuration error"
**Solution**: Check `.env.local` file exists and has correct variables

### ❌ "Failed to generate upload URL"
**Solution**: Verify cloud credentials are correct

### ❌ "Invalid file type"
**Solution**: Only PNG/JPEG allowed by default. Modify `ALLOWED_FILE_TYPES`

### ❌ "File too large"
**Solution**: File exceeds 2MB. Increase `FILE_UPLOAD_MAX_BYTES` if needed

### ❌ CORS Error
**Solution**: Add CORS configuration to your bucket/container

---

## Security Checklist

- [x] Credentials in `.env.local`, not in code
- [x] `.env.local` in `.gitignore`
- [x] Block public access enabled
- [x] Presigned URLs expire in 60 seconds
- [x] File type validation enabled
- [x] File size limits enforced
- [x] IAM policy has minimal permissions
- [x] Different credentials for dev/prod

---

## File Structure

```
jeevan-rakth/
├── .env.local                              # Environment variables
├── OBJECT_STORAGE_GUIDE.md                 # Full documentation
├── OBJECT_STORAGE_QUICK_START.md           # This file
└── src/
    ├── app/
    │   ├── api/
    │   │   └── storage/
    │   │       ├── s3-upload-url/
    │   │       │   └── route.ts            # AWS S3 API
    │   │       └── azure-upload-url/
    │   │           └── route.ts            # Azure Blob API
    │   └── storage-demo/
    │       └── page.tsx                    # Demo page
    └── components/
        └── FileUpload.tsx                  # Reusable component
```

---

## Next Steps

1. ✅ Configure cloud storage credentials
2. ✅ Test with demo page
3. 🔄 Integrate into your app
4. 📊 Monitor usage and costs
5. 🚀 Deploy to production

---

## Cost Estimate

**1,000 users × 1 image/month:**

| Provider | Storage | Requests | Total |
|----------|---------|----------|-------|
| AWS S3 | $0.05 | $0.005 | **~$0.06/month** |
| Azure Blob | $0.036 | $0.0044 | **~$0.04/month** |

💰 **Both options are extremely affordable!**

---

## Support

- 📖 [Full Documentation](./OBJECT_STORAGE_GUIDE.md)
- 🧪 [Test Demo](http://localhost:3000/storage-demo)
- 🔍 [Troubleshooting Guide](./OBJECT_STORAGE_GUIDE.md#troubleshooting)

---

**Happy uploading! 🎉**
