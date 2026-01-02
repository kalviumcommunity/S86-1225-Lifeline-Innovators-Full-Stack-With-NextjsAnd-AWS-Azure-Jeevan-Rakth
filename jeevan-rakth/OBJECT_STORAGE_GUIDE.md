# 📦 Object Storage Implementation Guide

## Complete AWS S3 & Azure Blob Storage Integration for Jeevan-Rakth

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [AWS S3 Setup](#aws-s3-setup)
4. [Azure Blob Storage Setup](#azure-blob-storage-setup)
5. [Implementation Details](#implementation-details)
6. [Security Considerations](#security-considerations)
7. [Testing Guide](#testing-guide)
8. [Cost Optimization](#cost-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Production Checklist](#production-checklist)

---

## 🎯 Overview

This implementation provides secure, scalable file upload functionality using cloud object storage services. Files are uploaded directly from the client to cloud storage using presigned URLs, eliminating the need to route large files through your Next.js server.

### Key Features

✅ **Direct Upload to Cloud** - Files never touch your application server  
✅ **Presigned URLs** - Time-limited, secure upload URLs  
✅ **File Validation** - Type and size validation on both client and server  
✅ **Multi-Cloud Support** - Works with both AWS S3 and Azure Blob Storage  
✅ **Zero Credential Exposure** - Credentials never sent to client  
✅ **Production Ready** - Includes error handling, retry logic, and monitoring  

### Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **AWS SDK**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- **Azure SDK**: `@azure/storage-blob`
- **Validation**: Client-side and server-side validation

---

## 🏗️ Architecture

### Presigned URL Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │         │  Next.js    │         │   Cloud     │
│  (Browser)  │         │   API       │         │  Storage    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ 1. Request URL        │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │                       │ 2. Generate URL       │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │ 3. Presigned URL      │
       │                       │<──────────────────────┤
       │ 4. Return URL         │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │ 5. Upload File        │                       │
       ├───────────────────────────────────────────────>│
       │                       │                       │
       │ 6. Success            │                       │
       │<───────────────────────────────────────────────┤
       │                       │                       │
```

### Benefits of This Approach

1. **Reduced Server Load** - No file processing on application server
2. **Better Performance** - Direct upload to cloud storage
3. **Scalability** - Cloud storage handles traffic spikes
4. **Cost Effective** - Pay only for storage and bandwidth used
5. **Security** - Credentials never exposed to client

---

## ☁️ AWS S3 Setup

### Step 1: Create S3 Bucket

1. Go to [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to **S3** → **Create bucket**
3. Configure bucket:

```
Bucket name: jeevan-rakth-storage
Region: ap-south-1 (or your preferred region)
Object Ownership: ACLs disabled (recommended)
Block Public Access: ✅ Block all public access
Bucket Versioning: Enable (optional, recommended)
Default encryption: Enable (SSE-S3)
```

4. Click **Create bucket**

### Step 2: Create IAM User

1. Navigate to **IAM** → **Users** → **Create user**
2. User name: `jeevan-rakth-storage-uploader`
3. Attach policies → **Create inline policy**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3UploadRead",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::jeevan-rakth-storage/*"
    },
    {
      "Sid": "AllowS3ListBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::jeevan-rakth-storage"
    }
  ]
}
```

4. Click **Create policy**

### Step 3: Generate Access Keys

1. Select the created user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Select **Application running outside AWS**
5. **Save the credentials securely**:
   - Access Key ID: `AKIAIOSFODNN7EXAMPLE`
   - Secret Access Key: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

⚠️ **IMPORTANT**: Store these credentials securely. You won't be able to retrieve the secret key again.

### Step 4: Configure CORS (Optional)

If you need to read files from the browser:

1. Go to your bucket → **Permissions** → **CORS**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 5: Update Environment Variables

Add to your `.env.local`:

```env
FILE_STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=your-actual-access-key-id
AWS_SECRET_ACCESS_KEY=your-actual-secret-access-key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=jeevan-rakth-storage
FILE_UPLOAD_URL_TTL_SECONDS=60
FILE_UPLOAD_MAX_BYTES=2097152
ALLOWED_FILE_TYPES=image/png,image/jpeg,image/jpg
```

---

## 🔷 Azure Blob Storage Setup

### Step 1: Create Storage Account

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Storage accounts** → **Create**
3. Configure storage account:

```
Resource group: jeevan-rakth-rg (create new)
Storage account name: jeevanrakthstorage
Region: Central India (or your preferred region)
Performance: Standard
Redundancy: LRS (Locally Redundant Storage)
```

4. Click **Review + create** → **Create**

### Step 2: Create Container

1. Open the storage account
2. Navigate to **Data storage** → **Containers**
3. Click **+ Container**

```
Name: uploads
Public access level: Private (no anonymous access)
```

4. Click **Create**

### Step 3: Get Access Keys

1. In your storage account, go to **Security + networking** → **Access keys**
2. Click **Show keys**
3. Copy:
   - Storage account name: `jeevanrakthstorage`
   - Key1 or Key2 value

### Step 4: Configure CORS (Optional)

1. Go to **Settings** → **Resource sharing (CORS)**
2. Add a rule for **Blob service**:

```
Allowed origins: http://localhost:3000, https://yourdomain.com
Allowed methods: GET, PUT, POST, DELETE
Allowed headers: *
Exposed headers: *
Max age: 3600
```

### Step 5: Update Environment Variables

Add to your `.env.local`:

```env
FILE_STORAGE_PROVIDER=azure
AZURE_STORAGE_ACCOUNT_NAME=jeevanrakthstorage
AZURE_STORAGE_ACCOUNT_KEY=your-actual-storage-account-key
AZURE_STORAGE_CONTAINER_NAME=uploads
FILE_UPLOAD_URL_TTL_SECONDS=60
FILE_UPLOAD_MAX_BYTES=2097152
ALLOWED_FILE_TYPES=image/png,image/jpeg,image/jpg
```

---

## 💻 Implementation Details

### API Endpoints

#### AWS S3 Presigned URL Endpoint

**File**: `src/app/api/storage/s3-upload-url/route.ts`

**GET Method**:
```
GET /api/storage/s3-upload-url?fileName=photo.jpg&fileType=image/jpeg&fileSize=150000
```

**Response**:
```json
{
  "success": true,
  "uploadUrl": "https://bucket.s3.region.amazonaws.com/uploads/1234567890-photo.jpg?X-Amz-...",
  "fileUrl": "https://bucket.s3.region.amazonaws.com/uploads/1234567890-photo.jpg",
  "fileKey": "uploads/1234567890-photo.jpg",
  "expiresIn": 60
}
```

#### Azure Blob SAS URL Endpoint

**File**: `src/app/api/storage/azure-upload-url/route.ts`

**GET Method**:
```
GET /api/storage/azure-upload-url?fileName=photo.jpg&fileType=image/jpeg&fileSize=150000
```

**Response**:
```json
{
  "success": true,
  "uploadUrl": "https://account.blob.core.windows.net/container/uploads/1234567890-photo.jpg?sv=...",
  "fileUrl": "https://account.blob.core.windows.net/container/uploads/1234567890-photo.jpg",
  "blobName": "uploads/1234567890-photo.jpg",
  "expiresIn": 60,
  "instructions": {
    "method": "PUT",
    "headers": {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": "image/jpeg"
    }
  }
}
```

### File Upload Component

**File**: `src/components/FileUpload.tsx`

**Features**:
- Drag and drop support
- Image preview
- Progress tracking
- Client-side validation
- Error handling
- Multi-provider support

**Usage**:
```tsx
import FileUpload from '@/components/FileUpload';

<FileUpload
  provider="aws"
  onUploadSuccess={(url, key) => console.log('Uploaded:', url)}
  onUploadError={(error) => console.error('Error:', error)}
  maxSizeMB={2}
  allowedTypes={['image/png', 'image/jpeg']}
/>
```

### Demo Page

**File**: `src/app/storage-demo/page.tsx`

**Access**: `http://localhost:3000/storage-demo`

Test both AWS S3 and Azure Blob Storage uploads with a beautiful UI.

---

## 🔒 Security Considerations

### 1. Credential Management

❌ **Never** commit credentials to version control  
✅ **Always** use environment variables  
✅ **Use** different credentials for development and production  
✅ **Rotate** access keys regularly (every 90 days)  

### 2. IAM Best Practices

✅ **Principle of Least Privilege** - Only grant necessary permissions  
✅ **Separate Users** - Different users for different applications  
✅ **Enable MFA** - Multi-factor authentication for IAM users  
✅ **Monitor Usage** - Use CloudWatch/Azure Monitor  

### 3. Presigned URL Security

| Feature | AWS S3 | Azure Blob |
|---------|--------|------------|
| Time Expiration | ✅ 60 seconds | ✅ 60 seconds |
| Specific Operations | ✅ PutObject only | ✅ Write only |
| File Type Restriction | ✅ ContentType header | ✅ Content-Type header |
| Size Limitation | ✅ Client validation | ✅ Client validation |

### 4. Public vs Private Access

#### Private (Recommended) ✅

- Files NOT accessible without authentication
- Use presigned URLs for downloads
- Better security and compliance
- Prevents unauthorized access

#### Public ❌

- Anyone with URL can access files
- No authentication required
- Risk of data leakage
- Not recommended for sensitive data

**Our Implementation**: Private access by default

### 5. File Validation

**Client-Side** (First line of defense):
```typescript
// File type check
if (!['image/png', 'image/jpeg'].includes(file.type)) {
  throw new Error('Invalid file type');
}

// File size check
if (file.size > 2 * 1024 * 1024) {
  throw new Error('File too large');
}
```

**Server-Side** (Final validation):
```typescript
// Validate in API endpoint
if (!ALLOWED_TYPES.includes(fileType)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}
```

### 6. Encryption

**AWS S3**:
- Server-side encryption enabled (SSE-S3)
- Data encrypted at rest automatically
- HTTPS for data in transit

**Azure Blob**:
- Encryption at rest enabled by default
- HTTPS for data in transit
- Optional customer-managed keys

---

## 🧪 Testing Guide

### 1. Local Testing

Start your development server:
```bash
npm run dev
```

Navigate to the demo page:
```
http://localhost:3000/storage-demo
```

### 2. Test Cases

#### ✅ Valid Upload
- File: PNG or JPEG
- Size: < 2MB
- Expected: Success

#### ❌ Invalid File Type
- File: PDF, TXT, etc.
- Expected: Error "Invalid file type"

#### ❌ File Too Large
- File: > 2MB
- Expected: Error "File too large"

#### ✅ AWS S3 Upload
- Provider: AWS
- Expected: File uploaded to S3 bucket

#### ✅ Azure Blob Upload
- Provider: Azure
- Expected: File uploaded to Azure container

### 3. Verify Uploads

**AWS S3**:
1. Go to AWS Console → S3
2. Open your bucket → `uploads/` folder
3. Verify file exists

**Azure Blob**:
1. Go to Azure Portal → Storage account
2. Open container → `uploads/` folder
3. Verify blob exists

### 4. Testing Scripts

Create a test script:

```javascript
// test-upload.js
async function testUpload() {
  const response = await fetch('/api/storage/s3-upload-url?fileName=test.jpg&fileType=image/jpeg&fileSize=1000');
  const data = await response.json();
  console.log('Presigned URL:', data.uploadUrl);
}

testUpload();
```

---

## 💰 Cost Optimization

### AWS S3 Pricing (ap-south-1 Region)

| Service | Cost |
|---------|------|
| Storage | $0.025 per GB/month (first 50 TB) |
| PUT Requests | $0.005 per 1,000 requests |
| GET Requests | $0.0004 per 1,000 requests |
| Data Transfer OUT | $0.109 per GB (first 10 TB/month) |
| Data Transfer IN | Free |

**Example Cost** (1,000 users uploading 1 image/month):
- Storage: 1,000 × 2MB = 2GB → **$0.05/month**
- PUT Requests: 1,000 requests → **$0.005**
- Total: **~$0.06/month** 💰

### Azure Blob Pricing (Central India Region)

| Service | Cost |
|---------|------|
| Storage (LRS) | $0.018 per GB/month |
| Write Operations | $0.044 per 10,000 transactions |
| Read Operations | $0.0036 per 10,000 transactions |
| Data Transfer OUT | $0.087 per GB (first 5 GB free) |
| Data Transfer IN | Free |

**Example Cost** (1,000 users uploading 1 image/month):
- Storage: 2GB → **$0.036/month**
- Write Operations: 1,000 requests → **$0.0044**
- Total: **~$0.04/month** 💰

### Cost Optimization Strategies

1. **Lifecycle Policies**
   - Delete temporary files after 30 days
   - Archive old files to cheaper storage tiers

2. **Compression**
   - Compress images before upload
   - Use efficient formats (WebP, AVIF)

3. **CDN Integration**
   - Use CloudFront (AWS) or Azure CDN
   - Reduce data transfer costs
   - Improve performance

4. **Storage Tiers**
   - Use Standard for frequent access
   - Use Infrequent Access for old files
   - Use Archive for long-term storage

5. **Request Optimization**
   - Batch operations when possible
   - Cache file URLs
   - Minimize redundant requests

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Server configuration error"

**Problem**: Missing environment variables

**Solution**:
```bash
# Check .env.local file exists
# Verify all required variables are set
# Restart development server
npm run dev
```

#### 2. "Failed to generate upload URL"

**Problem**: Invalid AWS/Azure credentials

**Solution**:
- Verify credentials in .env.local
- Check IAM user has correct permissions
- Ensure storage account/bucket exists

#### 3. "CORS error" when uploading

**Problem**: CORS not configured

**Solution**:
- Add CORS configuration to bucket/container
- Include your domain in AllowedOrigins
- Restart browser after CORS changes

#### 4. "SignatureDoesNotMatch" (AWS)

**Problem**: Incorrect secret key or time sync issue

**Solution**:
- Verify AWS_SECRET_ACCESS_KEY is correct
- Check system time is synchronized
- Regenerate access keys if needed

#### 5. "Signature validation failed" (Azure)

**Problem**: Incorrect storage account key

**Solution**:
- Verify AZURE_STORAGE_ACCOUNT_KEY
- Try regenerating the key
- Check account name matches exactly

#### 6. Upload succeeds but file not accessible

**Problem**: Private bucket/container without SAS URL

**Solution**:
- Use presigned URLs for downloads
- Or make bucket/container public (not recommended)
- Generate read SAS tokens for Azure

### Debug Mode

Enable verbose logging:

```typescript
// In API route
console.log('Environment variables:', {
  provider: process.env.FILE_STORAGE_PROVIDER,
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_BUCKET_NAME,
  // Don't log secrets!
});
```

---

## ✅ Production Checklist

### Before Deployment

- [ ] Environment variables configured in production
- [ ] Different credentials for production (not dev keys)
- [ ] Bucket/container created in production account
- [ ] IAM policies reviewed and minimal
- [ ] CORS configured for production domain
- [ ] File size limits appropriate for use case
- [ ] File type restrictions enforced
- [ ] Encryption enabled on bucket/container
- [ ] Versioning enabled (optional)
- [ ] Lifecycle policies configured
- [ ] Monitoring and logging enabled
- [ ] Error handling tested
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Backup strategy in place
- [ ] Cost alerts configured

### Monitoring

**AWS CloudWatch**:
- S3 bucket metrics
- Request counts
- Error rates
- Storage size trends

**Azure Monitor**:
- Storage account metrics
- Transaction counts
- Availability
- Latency

### Lifecycle Policy Example (AWS)

```json
{
  "Rules": [
    {
      "Id": "DeleteOldUploads",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "uploads/"
      },
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

### Backup Strategy

1. **Enable Versioning** - Recover from accidental deletions
2. **Cross-Region Replication** - Disaster recovery
3. **Regular Snapshots** - Point-in-time recovery
4. **Lifecycle Archiving** - Move old files to Glacier/Archive

---

## 📚 Additional Resources

### AWS S3
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Presigned URLs Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

### Azure Blob Storage
- [Azure Blob Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [SAS Tokens Guide](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
- [Best Practices](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-security-recommendations)

### Next.js
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 🎉 Summary

You now have a complete, production-ready object storage implementation with:

✅ Secure presigned URL uploads  
✅ Support for both AWS S3 and Azure Blob Storage  
✅ Comprehensive file validation  
✅ Beautiful demo interface  
✅ Complete documentation  
✅ Security best practices  
✅ Cost optimization strategies  

**Next Steps**:
1. Configure your cloud storage credentials
2. Test the implementation using the demo page
3. Integrate the FileUpload component into your app
4. Deploy to production with production credentials
5. Monitor usage and costs

---

**Built with ❤️ for Jeevan-Rakth**  
**Last Updated**: January 2, 2026
