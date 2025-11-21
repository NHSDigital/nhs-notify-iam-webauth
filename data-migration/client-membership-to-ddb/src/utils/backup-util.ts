import { writeJsonToFile } from '@/src/utils/aws/s3-util';
import { getAccountId } from '@/src/utils/aws/sts-utils';

export async function backupDataToS3(data: unknown, env: string) {
  const accountId = await getAccountId();
  const timestamp = new Date().toISOString().replaceAll(/[.:T-]/g, '');
  const path = `client-membership-to-ddb/${env}/${timestamp}.json`;
  const backupBucket = `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`;
  await writeJsonToFile(path, JSON.stringify(data, null, 2), backupBucket);
}
