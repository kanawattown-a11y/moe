import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.S3_REGION || "auto";
const endpoint = process.env.S3_ENDPOINT;
const accessKeyId = process.env.S3_ACCESS_KEY || "";
const secretAccessKey = process.env.S3_SECRET_KEY || "";
const bucketName = process.env.S3_BUCKET_NAME || "";
const publicUrlPrefix = process.env.S3_PUBLIC_URL_PREFIX || "";

// Only initialize if we have credentials
const isConfigured = Boolean(accessKeyId && secretAccessKey && bucketName);

const s3Client = new S3Client({
    region,
    ...(endpoint ? { endpoint } : {}),
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export async function uploadFileToS3(file: File, folder: string): Promise<string> {
    if (!isConfigured) {
        throw new Error("S3 is not configured in environment variables (S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME).");
    }

    if (!file || file.size === 0) {
        throw new Error("Invalid file provided");
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Generate a unique, safe filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: buffer,
        ContentType: file.type,
    });

    await s3Client.send(command);

    // Return the public URL
    if (publicUrlPrefix) {
        const base = publicUrlPrefix.replace(/\/$/, '');
        return `${base}/${uniqueFileName}`;
    }

    // Fallback URL patterns
    if (endpoint) {
        // e.g., Cloudflare R2 or DigitalOcean usually looks like this if public
        return `${endpoint.replace(/\/$/, '')}/${bucketName}/${uniqueFileName}`;
    }

    // Standard AWS public URL
    return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`;
}

export async function getPresignedUploadUrl(fileName: string, fileType: string, folder: string): Promise<{ uploadUrl: string, publicUrl: string }> {
    if (!isConfigured) {
        throw new Error("S3 is not configured.");
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        ContentType: fileType,
    });

    // Generate URL valid for 1 hour (3600 seconds)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    let publicUrl = "";
    if (publicUrlPrefix) {
        publicUrl = `${publicUrlPrefix.replace(/\/$/, '')}/${uniqueFileName}`;
    } else if (endpoint) {
        publicUrl = `${endpoint.replace(/\/$/, '')}/${bucketName}/${uniqueFileName}`;
    } else {
        publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`;
    }

    return { uploadUrl, publicUrl };
}
