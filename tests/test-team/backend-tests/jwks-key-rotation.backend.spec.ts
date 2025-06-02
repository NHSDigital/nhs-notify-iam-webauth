import { expect, test } from '@playwright/test';
import { deleteAllKeysForTags, getKmsPublicKey } from 'helpers/kms-util';
import { getParameter, putParameter } from 'helpers/ssm-util';
import { invokeLambda } from 'helpers/lambda-util';
import { readFile } from 'helpers/s3-util';
import { parseJwksPublicSigningKeys } from 'helpers/jwks-key-parser';

const nameTag = process.env.NAME_TAG || 'unknown';
const groupTag = process.env.GROUP_TAG || 'unknown';
const keyRotationLambdaName = process.env.KEY_ROTATION_LAMBDA_NAME || 'unknown';
const publicKeysS3BucketName =
  process.env.PUBLIC_KEYS_S3_BUCKET_NAME || 'unknown';
const keyDirectorySsmParameterName =
  process.env.KEY_DIRECTORY_SSM_PARAMETER_NAME || 'unknown';
const usageTag = 'CIS2-JWKS-AUTH';

test.describe('jwks-key-rotation', () => {
  test.beforeEach(async () => {
    // Delete any existing KMS key rotation keys for the environment
    await deleteAllKeysForTags(nameTag, groupTag, usageTag);

    // Clear key directory
    await putParameter('[]', keyDirectorySsmParameterName);
  });

  test.afterAll(async () => {
    await deleteAllKeysForTags(nameTag, groupTag, usageTag);
  });

  for (const { description, keyCount } of [
    { keyCount: 1, description: 'first' },
    { keyCount: 2, description: 'second' },
  ])
    test(`should generate ${description} key`, async () => {
      // arrange
      const today = new Date().toISOString().split('T')[0];

      // act
      // Invoke the key rotation lambda
      for (let i = 0; i < keyCount; i++) {
        await invokeLambda(keyRotationLambdaName);
      }

      // assert
      const jwksFileResponse = await readFile('jwks', publicKeysS3BucketName);
      const jwksFileBody =
        (await jwksFileResponse.Body?.transformToString()) || '';
      const jwksPublicKeys = await parseJwksPublicSigningKeys(jwksFileBody);
      const jwksKeyIds = jwksPublicKeys.map((publicKey) => publicKey.kid);

      const keyDirectoryContent = await getParameter(
        keyDirectorySsmParameterName
      );
      const keyDirectory = JSON.parse(keyDirectoryContent) as {
        kid: string;
        createdDate: string;
      }[];

      // Verify the contents of the JWKS public keys file in S3
      expect(jwksFileResponse.ContentType).toEqual('application/json');
      expect(jwksPublicKeys.length).toBe(keyCount);
      for (const publicKey of jwksPublicKeys) {
        expect(publicKey.use).toBe('sig');
        expect(publicKey.alg).toBe('RS512');
      }

      // Verify the contents of the key directory
      expect(keyDirectory.length).toEqual(jwksPublicKeys.length);
      for (const keyEntry of keyDirectory) {
        expect(
          jwksKeyIds.filter((keyId) => keyEntry.kid === keyId).length
        ).toBe(1);
        expect(keyEntry.createdDate).toBe(today);
      }

      // Verify the existance of the keys in KMS
      const kmsPublicKeys = await Promise.all(
        jwksKeyIds.map((keyId) => getKmsPublicKey(keyId))
      );
      expect(kmsPublicKeys.length).toEqual(jwksPublicKeys.length);
    });

  test('should trim out expired keys', async () => {
    // arrange

    // Populate the key directory with an expired key reference
    await putParameter(
      '[{"kid":"00000000-0000-0000-0000-000000000000","createdDate":"2000-01-01"}]',
      keyDirectorySsmParameterName
    );

    // act
    // Invoke the key rotation lambda
    await invokeLambda(keyRotationLambdaName);

    // assert
    const jwksFileResponse = await readFile('jwks', publicKeysS3BucketName);
    const jwksFileBody =
      (await jwksFileResponse.Body?.transformToString()) || '';
    const jwksPublicKeys = await parseJwksPublicSigningKeys(jwksFileBody);
    const jwksKeyIds = jwksPublicKeys.map((publicKey) => publicKey.kid);

    // Verify that the expired key has been removed
    expect(jwksPublicKeys.length, JSON.stringify(jwksPublicKeys)).toBe(1);
    expect(
      jwksKeyIds.filter(
        (keyId) => keyId === '00000000-0000-0000-0000-000000000000'
      ).length
    ).toBe(0);
  });
});
