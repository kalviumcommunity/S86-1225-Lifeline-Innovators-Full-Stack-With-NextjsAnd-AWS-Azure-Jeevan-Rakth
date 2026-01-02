# 🧪 Object Storage Testing Checklist

## Complete Testing Guide for AWS S3 & Azure Blob Storage

---

## 📋 Pre-Testing Setup

### Environment Configuration

- [ ] `.env.local` file exists in root directory
- [ ] All required environment variables are set
- [ ] Cloud storage credentials are valid
- [ ] Bucket/container exists in cloud account
- [ ] Development server is running (`npm run dev`)

### AWS S3 Checklist
```env
[ ] FILE_STORAGE_PROVIDER=aws
[ ] AWS_ACCESS_KEY_ID=<your-key>
[ ] AWS_SECRET_ACCESS_KEY=<your-secret>
[ ] AWS_REGION=ap-south-1
[ ] AWS_BUCKET_NAME=jeevan-rakth-storage
[ ] FILE_UPLOAD_URL_TTL_SECONDS=60
[ ] FILE_UPLOAD_MAX_BYTES=2097152
[ ] ALLOWED_FILE_TYPES=image/png,image/jpeg,image/jpg
```

### Azure Blob Checklist
```env
[ ] FILE_STORAGE_PROVIDER=azure
[ ] AZURE_STORAGE_ACCOUNT_NAME=jeevanrakthstorage
[ ] AZURE_STORAGE_ACCOUNT_KEY=<your-key>
[ ] AZURE_STORAGE_CONTAINER_NAME=uploads
[ ] FILE_UPLOAD_URL_TTL_SECONDS=60
[ ] FILE_UPLOAD_MAX_BYTES=2097152
[ ] ALLOWED_FILE_TYPES=image/png,image/jpeg,image/jpg
```

---

## 🧪 Test Cases

### 1. Basic Functionality Tests

#### Test 1.1: Valid PNG Upload (AWS S3)
- [ ] Navigate to `http://localhost:3000/storage-demo`
- [ ] Select AWS S3 provider
- [ ] Upload a valid PNG file (< 2MB)
- [ ] **Expected**: Upload succeeds, file URL displayed
- [ ] **Verify**: File appears in S3 bucket under `uploads/` folder

#### Test 1.2: Valid JPEG Upload (AWS S3)
- [ ] Select AWS S3 provider
- [ ] Upload a valid JPEG file (< 2MB)
- [ ] **Expected**: Upload succeeds, file URL displayed
- [ ] **Verify**: File appears in S3 bucket

#### Test 1.3: Valid PNG Upload (Azure Blob)
- [ ] Navigate to `http://localhost:3000/storage-demo`
- [ ] Select Azure Blob provider
- [ ] Upload a valid PNG file (< 2MB)
- [ ] **Expected**: Upload succeeds, file URL displayed
- [ ] **Verify**: File appears in Azure container under `uploads/` folder

#### Test 1.4: Valid JPEG Upload (Azure Blob)
- [ ] Select Azure Blob provider
- [ ] Upload a valid JPEG file (< 2MB)
- [ ] **Expected**: Upload succeeds, file URL displayed
- [ ] **Verify**: File appears in Azure container

---

### 2. File Type Validation Tests

#### Test 2.1: Invalid File Type - PDF
- [ ] Try to upload a PDF file
- [ ] **Expected**: Error message "Only image/png, image/jpeg, image/jpg files are allowed"
- [ ] **Verify**: File not uploaded, error displayed in red

#### Test 2.2: Invalid File Type - Text File
- [ ] Try to upload a .txt file
- [ ] **Expected**: Error message about invalid file type
- [ ] **Verify**: File not uploaded

#### Test 2.3: Invalid File Type - Video
- [ ] Try to upload a .mp4 file
- [ ] **Expected**: Error message about invalid file type
- [ ] **Verify**: File not uploaded

#### Test 2.4: Invalid File Type - Document
- [ ] Try to upload a .docx file
- [ ] **Expected**: Error message about invalid file type
- [ ] **Verify**: File not uploaded

---

### 3. File Size Validation Tests

#### Test 3.1: File Too Large (3MB)
- [ ] Try to upload an image > 2MB
- [ ] **Expected**: Error message "File too large. Maximum size is 2MB"
- [ ] **Verify**: File not uploaded

#### Test 3.2: File at Size Limit (2MB)
- [ ] Upload an image exactly 2MB
- [ ] **Expected**: Upload succeeds
- [ ] **Verify**: File uploaded successfully

#### Test 3.3: Very Small File (< 1KB)
- [ ] Upload a very small image (< 1KB)
- [ ] **Expected**: Upload succeeds
- [ ] **Verify**: File uploaded successfully

---

### 4. User Interface Tests

#### Test 4.1: Drag and Drop
- [ ] Drag a valid image onto the upload zone
- [ ] **Expected**: File selected, preview displayed
- [ ] **Verify**: File name and size shown

#### Test 4.2: Image Preview
- [ ] Select an image file
- [ ] **Expected**: Image preview displayed
- [ ] **Verify**: Preview is clear and correct

#### Test 4.3: Progress Tracking
- [ ] Upload a file
- [ ] **Expected**: Progress bar shows 0% → 10% → 30% → 100%
- [ ] **Verify**: Progress messages update correctly

#### Test 4.4: Success Message
- [ ] Complete a successful upload
- [ ] **Expected**: Green success message with file URL
- [ ] **Verify**: File URL is clickable and correct

#### Test 4.5: Error Display
- [ ] Trigger an error (invalid file type)
- [ ] **Expected**: Red error message displayed
- [ ] **Verify**: Error message is clear and helpful

#### Test 4.6: Cancel Upload
- [ ] Select a file
- [ ] Click Cancel button
- [ ] **Expected**: File selection cleared
- [ ] **Verify**: Form reset to initial state

#### Test 4.7: Upload Another File
- [ ] Complete an upload
- [ ] Click "Upload Another File"
- [ ] **Expected**: Form reset, ready for new upload
- [ ] **Verify**: Previous upload data cleared

---

### 5. Provider Switching Tests

#### Test 5.1: Switch from AWS to Azure
- [ ] Upload file with AWS provider
- [ ] Switch to Azure provider
- [ ] Upload another file
- [ ] **Expected**: Both uploads succeed
- [ ] **Verify**: Files in correct storage locations

#### Test 5.2: Switch from Azure to AWS
- [ ] Upload file with Azure provider
- [ ] Switch to AWS provider
- [ ] Upload another file
- [ ] **Expected**: Both uploads succeed
- [ ] **Verify**: Files in correct storage locations

---

### 6. API Endpoint Tests

#### Test 6.1: S3 Presigned URL Generation (GET)
```bash
curl "http://localhost:3000/api/storage/s3-upload-url?fileName=test.jpg&fileType=image/jpeg&fileSize=100000"
```
- [ ] Execute curl command
- [ ] **Expected**: JSON response with `uploadUrl`, `fileUrl`, `fileKey`
- [ ] **Verify**: All URLs are valid and properly formatted

#### Test 6.2: S3 Presigned URL Generation (POST)
```bash
curl -X POST http://localhost:3000/api/storage/s3-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileType":"image/jpeg","fileSize":100000}'
```
- [ ] Execute curl command
- [ ] **Expected**: JSON response with upload URL
- [ ] **Verify**: Response matches GET method format

#### Test 6.3: Azure SAS URL Generation (GET)
```bash
curl "http://localhost:3000/api/storage/azure-upload-url?fileName=test.jpg&fileType=image/jpeg&fileSize=100000"
```
- [ ] Execute curl command
- [ ] **Expected**: JSON response with `uploadUrl`, `fileUrl`, `blobName`
- [ ] **Verify**: SAS token included in URL

#### Test 6.4: Azure SAS URL Generation (POST)
```bash
curl -X POST http://localhost:3000/api/storage/azure-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileType":"image/jpeg","fileSize":100000}'
```
- [ ] Execute curl command
- [ ] **Expected**: JSON response with upload URL and instructions
- [ ] **Verify**: Headers include `x-ms-blob-type: BlockBlob`

---

### 7. Security Tests

#### Test 7.1: Missing Credentials (AWS)
- [ ] Remove AWS credentials from .env.local
- [ ] Try to upload
- [ ] **Expected**: "Server configuration error"
- [ ] **Restore credentials**

#### Test 7.2: Missing Credentials (Azure)
- [ ] Remove Azure credentials from .env.local
- [ ] Try to upload
- [ ] **Expected**: "Server configuration error"
- [ ] **Restore credentials**

#### Test 7.3: Invalid AWS Credentials
- [ ] Set invalid AWS_ACCESS_KEY_ID
- [ ] Try to upload
- [ ] **Expected**: Upload fails with authentication error
- [ ] **Restore valid credentials**

#### Test 7.4: Invalid Azure Credentials
- [ ] Set invalid AZURE_STORAGE_ACCOUNT_KEY
- [ ] Try to upload
- [ ] **Expected**: Upload fails with authentication error
- [ ] **Restore valid credentials**

#### Test 7.5: Presigned URL Expiration
- [ ] Set FILE_UPLOAD_URL_TTL_SECONDS=5
- [ ] Get presigned URL
- [ ] Wait 10 seconds
- [ ] Try to upload with expired URL
- [ ] **Expected**: Upload fails (403 or 400 error)
- [ ] **Restore TTL to 60**

#### Test 7.6: File Type Bypass Attempt
- [ ] Rename virus.exe to virus.jpg
- [ ] Try to upload
- [ ] **Expected**: Should fail if MIME type detection is enabled
- [ ] **Note**: Current implementation validates extension, not content

---

### 8. Error Handling Tests

#### Test 8.1: Network Error Simulation
- [ ] Disconnect internet
- [ ] Try to upload
- [ ] **Expected**: Error message displayed
- [ ] **Reconnect internet**

#### Test 8.2: Invalid Bucket Name (AWS)
- [ ] Set AWS_BUCKET_NAME to non-existent bucket
- [ ] Try to upload
- [ ] **Expected**: Error message
- [ ] **Restore correct bucket name**

#### Test 8.3: Invalid Container Name (Azure)
- [ ] Set AZURE_STORAGE_CONTAINER_NAME to non-existent container
- [ ] Try to upload
- [ ] **Expected**: Error message
- [ ] **Restore correct container name**

#### Test 8.4: Missing Query Parameters
```bash
curl "http://localhost:3000/api/storage/s3-upload-url"
```
- [ ] Execute curl without parameters
- [ ] **Expected**: 400 error, "Missing required parameters"

#### Test 8.5: Invalid File Size Parameter
```bash
curl "http://localhost:3000/api/storage/s3-upload-url?fileName=test.jpg&fileType=image/jpeg&fileSize=10000000"
```
- [ ] Execute curl with large fileSize
- [ ] **Expected**: 400 error, "File too large"

---

### 9. Integration Tests

#### Test 9.1: Multiple Consecutive Uploads
- [ ] Upload 5 files in a row
- [ ] **Expected**: All uploads succeed
- [ ] **Verify**: All files in storage

#### Test 9.2: Concurrent Uploads
- [ ] Open demo page in 2 browser tabs
- [ ] Upload different files simultaneously
- [ ] **Expected**: Both uploads succeed
- [ ] **Verify**: Both files in storage

#### Test 9.3: Upload After Page Refresh
- [ ] Start upload
- [ ] Refresh page mid-upload
- [ ] Upload again
- [ ] **Expected**: New upload works correctly

---

### 10. Cloud Storage Verification Tests

#### Test 10.1: Verify File in AWS S3
- [ ] Upload file via app
- [ ] Open AWS Console → S3
- [ ] Navigate to bucket → uploads folder
- [ ] **Expected**: File exists with timestamp prefix
- [ ] **Verify**: File size matches original

#### Test 10.2: Verify File in Azure Blob
- [ ] Upload file via app
- [ ] Open Azure Portal → Storage Account
- [ ] Navigate to container → uploads folder
- [ ] **Expected**: Blob exists with timestamp prefix
- [ ] **Verify**: Blob size matches original

#### Test 10.3: Verify File Permissions (AWS)
- [ ] Try to access file URL without authentication
- [ ] **Expected**: Access denied (private bucket)
- [ ] **Note**: Or file accessible if bucket is public

#### Test 10.4: Verify File Permissions (Azure)
- [ ] Try to access blob URL without SAS token
- [ ] **Expected**: Access denied (private container)

#### Test 10.5: Verify File Metadata (AWS)
- [ ] Check uploaded file properties in S3
- [ ] **Expected**: Metadata includes upload timestamp, original filename
- [ ] **Verify**: Content-Type is correct

#### Test 10.6: Verify File Metadata (Azure)
- [ ] Check uploaded blob properties in Azure
- [ ] **Expected**: Metadata includes upload info
- [ ] **Verify**: Content-Type is correct

---

### 11. Performance Tests

#### Test 11.1: Upload Speed (Small File)
- [ ] Upload 100KB file
- [ ] **Expected**: Completes in < 2 seconds
- [ ] **Measure**: Note actual time

#### Test 11.2: Upload Speed (Medium File)
- [ ] Upload 1MB file
- [ ] **Expected**: Completes in < 5 seconds
- [ ] **Measure**: Note actual time

#### Test 11.3: Upload Speed (Large File)
- [ ] Upload 2MB file (max allowed)
- [ ] **Expected**: Completes in < 10 seconds
- [ ] **Measure**: Note actual time

---

### 12. Mobile Responsiveness Tests

#### Test 12.1: Mobile View (iPhone)
- [ ] Open demo page on iPhone or simulator
- [ ] **Expected**: Layout adapts to small screen
- [ ] **Verify**: Upload component usable

#### Test 12.2: Mobile View (Android)
- [ ] Open demo page on Android or emulator
- [ ] **Expected**: Layout adapts to small screen
- [ ] **Verify**: All buttons accessible

#### Test 12.3: Tablet View (iPad)
- [ ] Open demo page on iPad or simulator
- [ ] **Expected**: Layout uses available space well
- [ ] **Verify**: Components properly sized

---

### 13. Browser Compatibility Tests

#### Test 13.1: Chrome
- [ ] Open demo in Chrome
- [ ] Upload file
- [ ] **Expected**: Works perfectly

#### Test 13.2: Firefox
- [ ] Open demo in Firefox
- [ ] Upload file
- [ ] **Expected**: Works perfectly

#### Test 13.3: Safari
- [ ] Open demo in Safari
- [ ] Upload file
- [ ] **Expected**: Works perfectly

#### Test 13.4: Edge
- [ ] Open demo in Edge
- [ ] Upload file
- [ ] **Expected**: Works perfectly

---

### 14. Production Readiness Tests

#### Test 14.1: Environment Variable Validation
- [ ] Remove one required env var
- [ ] Restart server
- [ ] Try to upload
- [ ] **Expected**: Clear error message
- [ ] **Restore env var**

#### Test 14.2: Credential Rotation
- [ ] Generate new AWS access keys
- [ ] Update .env.local
- [ ] Restart server
- [ ] Upload file
- [ ] **Expected**: Works with new keys
- [ ] **Delete old keys from AWS**

#### Test 14.3: Load Testing Simulation
- [ ] Use script to generate 100 upload requests
- [ ] **Expected**: All succeed or fail gracefully
- [ ] **Verify**: No server crashes

---

## 📊 Test Results Template

### Test Execution Summary

**Date**: _______________  
**Tester**: _______________  
**Environment**: Development / Staging / Production

| Category | Tests Passed | Tests Failed | Pass Rate |
|----------|--------------|--------------|-----------|
| Basic Functionality | __/8 | __ | __% |
| File Type Validation | __/4 | __ | __% |
| File Size Validation | __/3 | __ | __% |
| User Interface | __/7 | __ | __% |
| Provider Switching | __/2 | __ | __% |
| API Endpoints | __/4 | __ | __% |
| Security | __/6 | __ | __% |
| Error Handling | __/5 | __ | __% |
| Integration | __/3 | __ | __% |
| Cloud Verification | __/6 | __ | __% |
| Performance | __/3 | __ | __% |
| Mobile Responsiveness | __/3 | __ | __% |
| Browser Compatibility | __/4 | __ | __% |
| Production Readiness | __/3 | __ | __% |
| **TOTAL** | **__/61** | **__** | **__%** |

### Critical Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## 🎯 Acceptance Criteria

For production deployment, ensure:

- [ ] ✅ All basic functionality tests pass (100%)
- [ ] ✅ All security tests pass (100%)
- [ ] ✅ File validation works correctly (100%)
- [ ] ✅ At least 95% of all tests pass
- [ ] ✅ No critical security issues
- [ ] ✅ Performance meets requirements
- [ ] ✅ Works on all major browsers
- [ ] ✅ Mobile responsive
- [ ] ✅ Error handling is user-friendly
- [ ] ✅ Documentation is complete

---

## 🔄 Continuous Testing

### Daily Smoke Tests
- [ ] Upload one file with AWS S3
- [ ] Upload one file with Azure Blob
- [ ] Verify files appear in storage

### Weekly Regression Tests
- [ ] Run all basic functionality tests
- [ ] Run all security tests
- [ ] Check for new browser updates

### Monthly Comprehensive Tests
- [ ] Run entire test suite
- [ ] Load testing
- [ ] Security audit
- [ ] Cost analysis

---

## 🐛 Bug Report Template

**Bug ID**: _______________  
**Date Found**: _______________  
**Severity**: Critical / High / Medium / Low  
**Test Case**: _______________  

**Description**: _______________________________________________

**Steps to Reproduce**:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Expected Result**: _______________________________________________

**Actual Result**: _______________________________________________

**Screenshots**: _______________________________________________

**Environment**: _______________________________________________

**Status**: Open / In Progress / Resolved / Closed

---

## ✅ Sign-Off

**Tested By**: _______________  
**Date**: _______________  
**Signature**: _______________  

**Approved By**: _______________  
**Date**: _______________  
**Signature**: _______________  

---

**Testing Status**: 🧪 Ready for Testing  
**Last Updated**: January 2, 2026
