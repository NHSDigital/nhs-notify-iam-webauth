import { writeJsonToFile } from '@/src/utils/aws/s3-util';
import { getAccountId } from '@/src/utils/aws/sts-utils';
import { backupDataToS3 } from '@/src/utils/backup-util';

jest.mock('@/src/utils/aws/s3-util');
jest.mock('@/src/utils/aws/sts-utils');

describe('backup-util', () => {
  test('should backup data to S3 with correct path and bucket', async () => {
    // arrange
    const mockedWriteJsonToFile = jest.mocked(writeJsonToFile);
    jest.mocked(getAccountId).mockResolvedValue('000000000000');

    const dataToBackup = { key: 'value' };

    // act
    await backupDataToS3(dataToBackup, 'main');

    // assert
    expect(mockedWriteJsonToFile).toHaveBeenCalledTimes(1);
    expect(mockedWriteJsonToFile).toHaveBeenCalledWith(
      expect.stringMatching(/^client-membership-to-ddb\/main\/\d{8}.+\.json$/),
      JSON.stringify(dataToBackup, null, 2),
      'nhs-notify-000000000000-eu-west-2-main-acct-migration-backup'
    );
  });
});
