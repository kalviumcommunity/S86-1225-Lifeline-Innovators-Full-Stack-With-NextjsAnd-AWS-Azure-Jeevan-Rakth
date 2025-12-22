import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

const STORAGE_DRIVER = (
  process.env.FILE_STORAGE_PROVIDER ?? "aws"
).toLowerCase();
const URL_TTL_SECONDS = Math.max(
  1,
  Number.parseInt(process.env.FILE_UPLOAD_URL_TTL_SECONDS ?? "120", 10)
);
export const MAX_UPLOAD_BYTES = Math.max(
  1,
  Number.parseInt(process.env.FILE_UPLOAD_MAX_BYTES ?? `${5 * 1024 * 1024}`, 10)
);
const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf"];

let s3Client: S3Client | null = null;

function sanitizeFileName(filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return safe.length > 0 ? safe : `file-${Date.now()}`;
}

function ensureAwsClient() {
  if (!s3Client) {
    const region = process.env.AWS_REGION;
    if (!region) {
      throw new Error("AWS_REGION is not configured");
    }
    s3Client = new S3Client({ region });
  }
  return s3Client;
}

function validateMimeType(mimeType: string) {
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

export type PresignRequest = {
  filename: string;
  fileType: string;
  fileSize: number;
};

export type PresignResult = {
  uploadURL: string;
  objectKey: string;
  provider: "aws" | "azure";
  expiresAt: string;
  requiredHeaders?: Record<string, string>;
};

function assertFileConstraints({ fileType, fileSize }: PresignRequest) {
  if (!validateMimeType(fileType)) {
    throw new Error("Unsupported file type");
  }
  if (fileSize > MAX_UPLOAD_BYTES) {
    throw new Error("File too large");
  }
}

async function generateAwsUrl(request: PresignRequest): Promise<PresignResult> {
  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME is not configured");
  }

  const client = ensureAwsClient();
  const sanitizedFilename = sanitizeFileName(request.filename);
  const objectKey = `uploads/${Date.now()}-${randomUUID()}-${sanitizedFilename}`;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: request.fileType,
  });

  const uploadURL = await getSignedUrl(client, command, {
    expiresIn: URL_TTL_SECONDS,
  });

  const expiresAt = new Date(Date.now() + URL_TTL_SECONDS * 1000).toISOString();

  return {
    uploadURL,
    objectKey,
    provider: "aws",
    expiresAt,
  };
}

async function generateAzureUrl(
  request: PresignRequest
): Promise<PresignResult> {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  if (!accountName || !accountKey || !containerName) {
    throw new Error(
      "Azure storage environment variables are not fully configured"
    );
  }

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const sanitizedFilename = sanitizeFileName(request.filename);
  const blobName = `uploads/${Date.now()}-${randomUUID()}-${sanitizedFilename}`;

  const expiresOn = new Date(Date.now() + URL_TTL_SECONDS * 1000);
  const permissions = BlobSASPermissions.parse("cw");

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions,
      expiresOn,
      contentType: request.fileType,
    },
    credential
  ).toString();

  const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
  const uploadURL = `${baseUrl}?${sas}`;

  return {
    uploadURL,
    objectKey: blobName,
    provider: "azure",
    expiresAt: expiresOn.toISOString(),
    requiredHeaders: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": request.fileType,
    },
  };
}

export async function generatePresignedUpload(
  request: PresignRequest
): Promise<PresignResult> {
  assertFileConstraints(request);

  if (STORAGE_DRIVER === "azure") {
    return generateAzureUrl(request);
  }

  return generateAwsUrl(request);
}

export function getAllowedMimePrefixes() {
  return [...ALLOWED_MIME_PREFIXES];
}

export { URL_TTL_SECONDS as DEFAULT_URL_TTL_SECONDS };
