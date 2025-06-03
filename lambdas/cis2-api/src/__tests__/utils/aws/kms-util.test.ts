import { getPayloadSignature } from '@/src/utils/aws/kms-util';
import { KMSClient, SignCommand } from '@aws-sdk/client-kms';

jest.mock('@aws-sdk/client-kms', () => ({
  ...jest.requireActual('@aws-sdk/client-kms'),
}));

describe('kms-util', () => {
  describe('getPayloadSignature', () => {
    test('should get payload signature', async () => {
      // arrange
      const mockSignature = 'mock-signature';
      const mockResponse = {
        Signature: Buffer.from(mockSignature, 'utf-8'),
      };
      const kmsClientSpy = jest
        .spyOn(KMSClient.prototype, 'send')
        .mockImplementation(() => mockResponse);
      const testMessage = 'test payload';
      const expectedMessageBytes = Buffer.from(testMessage, 'utf-8');

      // act
      const result = await getPayloadSignature('test-key-id', testMessage);

      // assert
      expect(result).toBe('bW9jay1zaWduYXR1cmU');
      expect(kmsClientSpy).toHaveBeenCalledWith(expect.any(SignCommand));
      expect(kmsClientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            KeyId: 'test-key-id',
            Message: expectedMessageBytes,
            SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_512',
          },
        })
      );
    });
  });
});
