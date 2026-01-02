"use client";

import { useState, useRef, ChangeEvent } from "react";

/**
 * File Upload Component with Validation
 *
 * Features:
 * - Client-side file type validation
 * - File size validation
 * - Progress tracking
 * - Support for both AWS S3 and Azure Blob Storage
 * - Drag and drop support
 * - Preview for images
 */

interface FileUploadProps {
  onUploadSuccess?: (fileUrl: string, fileKey: string) => void;
  onUploadError?: (error: string) => void;
  provider?: "aws" | "azure";
  maxSizeMB?: number;
  allowedTypes?: string[];
  buttonText?: string;
  className?: string;
}

interface UploadProgress {
  uploading: boolean;
  progress: number;
  message: string;
}

export default function FileUpload({
  onUploadSuccess,
  onUploadError,
  provider = "aws",
  maxSizeMB = 2,
  allowedTypes = ["image/png", "image/jpeg", "image/jpg"],
  buttonText = "Upload File",
  className = "",
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    uploading: false,
    progress: 0,
    message: "",
  });
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Only ${allowedTypes.join(", ")} files are allowed.`;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setError(null);
    setUploadedFileUrl(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onUploadError) onUploadError(validationError);
      return;
    }

    setSelectedFile(file);

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Upload file to cloud storage
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    try {
      setUploadProgress({
        uploading: true,
        progress: 10,
        message: "Requesting upload URL...",
      });
      setError(null);

      // Determine API endpoint based on provider
      const endpoint =
        provider === "aws"
          ? "/api/storage/s3-upload-url"
          : "/api/storage/azure-upload-url";

      // Request presigned/SAS URL from backend
      const urlParams = new URLSearchParams({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size.toString(),
      });

      const response = await fetch(`${endpoint}?${urlParams}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to get upload URL");
      }

      setUploadProgress({
        uploading: true,
        progress: 30,
        message: "Uploading file...",
      });

      // Upload file directly to cloud storage
      const uploadHeaders: HeadersInit = {
        "Content-Type": selectedFile.type,
      };

      // Azure requires additional headers
      if (provider === "azure") {
        uploadHeaders["x-ms-blob-type"] = "BlockBlob";
      }

      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: uploadHeaders,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      setUploadProgress({
        uploading: true,
        progress: 100,
        message: "Upload complete!",
      });
      setUploadedFileUrl(data.fileUrl);

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(data.fileUrl, data.fileKey || data.blobName);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadProgress({ uploading: false, progress: 0, message: "" });
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      setUploadProgress({ uploading: false, progress: 0, message: "" });
      if (onUploadError) onUploadError(errorMessage);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadedFileUrl(null);
    setError(null);
    setUploadProgress({ uploading: false, progress: 0, message: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={allowedTypes.join(",")}
          className="hidden"
          id="file-input"
        />

        {!selectedFile ? (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your file here, or
            </p>
            <label
              htmlFor="file-input"
              className="mt-2 cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
            >
              browse files
            </label>
            <p className="mt-1 text-xs text-gray-500">
              {allowedTypes.join(", ")} (max {maxSizeMB}MB)
            </p>
          </div>
        ) : (
          <div>
            {/* File Preview */}
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                className="mx-auto max-h-48 rounded mb-4"
              />
            )}
            <p className="text-sm font-medium text-gray-700">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{uploadProgress.message}</span>
            <span className="text-gray-500">{uploadProgress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadedFileUrl && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 font-medium mb-2">
            File uploaded successfully!
          </p>
          <p className="text-xs text-gray-600 break-all">{uploadedFileUrl}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        {selectedFile && !uploadProgress.uploading && !uploadedFileUrl && (
          <>
            <button
              onClick={handleUpload}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {buttonText}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </>
        )}

        {uploadedFileUrl && (
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Upload Another File
          </button>
        )}
      </div>

      {/* Provider Badge */}
      <div className="mt-4 text-center">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          Using {provider === "aws" ? "AWS S3" : "Azure Blob Storage"}
        </span>
      </div>
    </div>
  );
}
