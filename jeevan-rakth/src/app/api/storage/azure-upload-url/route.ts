import { NextRequest, NextResponse } from "next/server";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

/**
 * Azure Blob Storage SAS URL Generator
 *
 * This endpoint generates a Shared Access Signature (SAS) URL that allows clients
 * to upload files directly to Azure Blob Storage without exposing storage credentials.
 *
 * Security Features:
 * - Time-limited URLs (expires in 60 seconds by default)
 * - File type validation
 * - File size restrictions
 * - Private container access only
 */

// Configuration
const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";
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
    if (!ACCOUNT_NAME || !ACCOUNT_KEY || !CONTAINER_NAME) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "Azure Blob Storage credentials not properly configured",
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

    // Generate unique blob name with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobName = `uploads/${timestamp}-${sanitizedFileName}`;

    // Create shared key credential
    const sharedKeyCredential = new StorageSharedKeyCredential(
      ACCOUNT_NAME,
      ACCOUNT_KEY
    );

    // Create BlobServiceClient
    const blobServiceClient = new BlobServiceClient(
      `https://${ACCOUNT_NAME}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Get container client
    const containerClient =
      blobServiceClient.getContainerClient(CONTAINER_NAME);

    // Get blob client
    const blobClient = containerClient.getBlobClient(blobName);

    // Set SAS expiration time
    const expiresOn = new Date();
    expiresOn.setSeconds(expiresOn.getSeconds() + URL_EXPIRATION);

    // Generate SAS token with write permission
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: CONTAINER_NAME,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("w"), // Write permission only
        startsOn: new Date(),
        expiresOn: expiresOn,
      },
      sharedKeyCredential
    ).toString();

    // Construct the upload URL with SAS token
    const uploadUrl = `${blobClient.url}?${sasToken}`;

    // Construct the permanent file URL (without SAS token - requires container to be public or separate read SAS)
    const fileUrl = blobClient.url;

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileUrl,
      blobName,
      expiresIn: URL_EXPIRATION,
      message: "SAS URL generated successfully",
      instructions: {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": fileType,
        },
      },
    });
  } catch (error) {
    console.error("Error generating SAS URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: POST method for more complex scenarios
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, folder = "uploads" } = body;

    // Validate environment variables
    if (!ACCOUNT_NAME || !ACCOUNT_KEY || !CONTAINER_NAME) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "Azure Blob Storage credentials not properly configured",
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

    // Generate unique blob name
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobName = `${folder}/${timestamp}-${sanitizedFileName}`;

    // Create shared key credential
    const sharedKeyCredential = new StorageSharedKeyCredential(
      ACCOUNT_NAME,
      ACCOUNT_KEY
    );

    // Create BlobServiceClient
    const blobServiceClient = new BlobServiceClient(
      `https://${ACCOUNT_NAME}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Get container and blob clients
    const containerClient =
      blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobName);

    // Set SAS expiration time
    const expiresOn = new Date();
    expiresOn.setSeconds(expiresOn.getSeconds() + URL_EXPIRATION);

    // Generate SAS token
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: CONTAINER_NAME,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("w"),
        startsOn: new Date(),
        expiresOn: expiresOn,
      },
      sharedKeyCredential
    ).toString();

    // Construct URLs
    const uploadUrl = `${blobClient.url}?${sasToken}`;
    const fileUrl = blobClient.url;

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileUrl,
      blobName,
      expiresIn: URL_EXPIRATION,
      message: "SAS URL generated successfully",
      instructions: {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": fileType,
        },
      },
    });
  } catch (error) {
    console.error("Error generating SAS URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
