import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * AWS S3 Presigned URL Generator
 *
 * This endpoint generates a presigned URL that allows clients to upload files
 * directly to S3 without exposing AWS credentials.
 *
 * Security Features:
 * - Time-limited URLs (expires in 60 seconds by default)
 * - File type validation
 * - File size restrictions
 * - No public access by default
 */

// Initialize S3 client with credentials from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Configuration
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const URL_EXPIRATION = parseInt(
  process.env.FILE_UPLOAD_URL_TTL_SECONDS || "60"
);
const MAX_FILE_SIZE = parseInt(process.env.FILE_UPLOAD_MAX_BYTES || "2097152"); // 2MB default
const ALLOWED_TYPES = (
  process.env.ALLOWED_FILE_TYPES || "image/png,image/jpeg,image/jpg"
).split(",");

export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    if (
      !BUCKET_NAME ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "AWS S3 credentials not properly configured",
        },
        { status: 500 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");
    const fileSize = parseInt(searchParams.get("fileSize") || "0");

    // Validate required parameters
    if (!fileName || !fileType) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          message: "fileName and fileType are required",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: `Only ${ALLOWED_TYPES.join(", ")} files are allowed`,
          allowedTypes: ALLOWED_TYPES,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          message: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 }
      );
    }

    // Generate unique file key with timestamp to prevent collisions
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `uploads/${timestamp}-${sanitizedFileName}`;

    // Create the PutObject command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      // Optional: Add metadata
      Metadata: {
        "uploaded-at": new Date().toISOString(),
        "original-name": fileName,
      },
    });

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRATION,
    });

    // Construct the file URL (this will be the permanent URL after upload)
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileUrl,
      fileKey,
      expiresIn: URL_EXPIRATION,
      message: "Presigned URL generated successfully",
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: POST method for more complex scenarios with request body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, folder = "uploads" } = body;

    // Validate environment variables
    if (
      !BUCKET_NAME ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "AWS S3 credentials not properly configured",
        },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!fileName || !fileType) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "fileName and fileType are required",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: `Only ${ALLOWED_TYPES.join(", ")} files are allowed`,
          allowedTypes: ALLOWED_TYPES,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          message: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 }
      );
    }

    // Generate unique file key
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `${folder}/${timestamp}-${sanitizedFileName}`;

    // Create the PutObject command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        "uploaded-at": new Date().toISOString(),
        "original-name": fileName,
      },
    });

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRATION,
    });

    // Construct the file URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileUrl,
      fileKey,
      expiresIn: URL_EXPIRATION,
      message: "Presigned URL generated successfully",
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
