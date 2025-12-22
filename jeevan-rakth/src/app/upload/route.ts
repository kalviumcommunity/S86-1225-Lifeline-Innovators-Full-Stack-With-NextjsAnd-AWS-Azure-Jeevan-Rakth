import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function POST(req: Request) {
  try {
    const { filename, fileType, fileSize } = await req.json();

    // 🔒 Validation
    if (!fileType.startsWith("image/") && fileType !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Invalid file type" },
        { status: 400 }
      );
    }

    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `uploads/${Date.now()}-${filename}`,
      ContentType: fileType,
    });

    const uploadURL = await getSignedUrl(s3, command, {
      expiresIn: 60, // 60 seconds
    });

    return NextResponse.json({
      success: true,
      uploadURL,
    });
  } catch (error) {
    console.error("Failed to generate upload URL", error);
    return NextResponse.json(
      { success: false, message: "Could not generate URL" },
      { status: 500 }
    );
  }
}
