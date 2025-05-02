import { test, expect } from '@playwright/test';
import { deleteAllKeysForTags } from '../helpers/kms-util';
import { putParameter } from '../helpers/ssm-util';

const nameTag = process.env.NAME_TAG || 'unknown';
const groupTag = process.env.GROUP_TAG || 'unknown';
const usageTag = 'CIS2-JWKS-AUTH';

test.describe('jwks-key-rotation', () => {
  test('should generate first key', async () => {
    // arrange

    // Delete any existing KMS key rotation keys for the environment
    await deleteAllKeysForTags(nameTag, groupTag, usageTag);

    // Clear key directory
    await putParameter('[]', process.env.KEY_DIRECTORY_SSM_PARAMETER_NAME);

    // act
    // Invoke the key rotation lambda

    // assert

    // Verify the contents of the JWKS public keys file in S3
    // Verify the contents of the key directory
    // Verify the existance of the key in KMS
  });
});
