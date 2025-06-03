import {
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

export async function readFile(
  path: string,
  bucket: string
): Promise<GetObjectCommandOutput> {
  return s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: path,
    })
  );
}
