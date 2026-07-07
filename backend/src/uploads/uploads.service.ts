import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  async presign(filename: string, contentType: string) {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION ?? process.env.AWS_REGION;
    if (!bucket || !region || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new ServiceUnavailableException(
        'Object storage is not configured. Set S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
      );
    }

    const safeName = filename.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

    const client = new S3Client({
      region,
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: !!process.env.S3_ENDPOINT,
    });
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
      { expiresIn: 300 },
    );

    const publicBase =
      process.env.S3_PUBLIC_URL ?? `https://${bucket}.s3.${region}.amazonaws.com`;
    return { uploadUrl, key, publicUrl: `${publicBase.replace(/\/$/, '')}/${key}` };
  }
}
