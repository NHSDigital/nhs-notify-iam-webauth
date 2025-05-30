import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { writeJsonToFile } from '@/src/utils/aws/s3-util';

jest.mock('@aws-sdk/client-s3', () => ({
  ...jest.requireActual('@aws-sdk/client-s3'),
}));
jest.mock('@/src/utils/logger');

describe('s3-util', () => {
  describe('writeJsonToFile', () => {
    test('should write JSON file to S3', async () => {
      // arrange
      const mockResponse = {};
      const sendSpy = jest.spyOn(S3Client.prototype, 'send');
      sendSpy.mockImplementation(() => mockResponse);

      // act
      const result = await writeJsonToFile(
        'jwks',
        '{"test":123}',
        'bucket-name'
      );

      // assert
      expect(result).toBe(mockResponse);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Body: '{"test":123}',
            Bucket: 'bucket-name',
            ContentType: 'application/json',
            Key: 'jwks',
          },
        })
      );
    });

    test('should reject missing bucket', async () => {
      // act
      let error;
      try {
        await writeJsonToFile('jwks', '{"test":123}');
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe('Missing bucket');
    });
  });
});
