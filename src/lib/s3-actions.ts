'use server';

import { getPresignedUploadUrl } from './s3';
import { auth } from '@/auth';

/**
 * Server Action to generate a presigned URL for direct S3 upload.
 * Secured to logged-in users only.
 */
export async function getS3PresignedUrl(fileName: string, fileType: string, folder: string) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    try {
        return await getPresignedUploadUrl(fileName, fileType, folder);
    } catch (error) {
        console.error("Presigned URL Error:", error);
        throw new Error("Failed to generate upload URL");
    }
}
