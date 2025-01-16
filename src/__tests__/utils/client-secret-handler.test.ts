import { generateClientSecretHash } from '@/src/utils/basic-auth/client-secret-handler';
import { getConstants } from '@/src/utils/public-constants';

jest.mock('@/src/utils/public-constants');

const getConstantsMock = jest.mocked(getConstants);

describe('client-secret-handler', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.USER_POOL_CLIENT_SECRET = 'test-client-secret';
    getConstantsMock.mockReturnValue({
      USER_POOL_CLIENT_ID: 'test-client-id',
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should generate a client secret hash', async () => {
    // act
    const result = await generateClientSecretHash('test-username');

    // assert
    expect(result).toBe('vSutcpF2+6URCqGiywOCNa4QwJcSig4l6MuYbwijAN4=');
  });

  it('should reject missing client id', async () => {
    // arrange
    getConstantsMock.mockReturnValue({
      USER_POOL_CLIENT_ID: '',
    });

    // act
    let error;
    try {
      await generateClientSecretHash('test-username');
    } catch (error_) {
      error = error_;
    }

    // assert
    expect(error).toBeTruthy();
    expect((error as Error).message).toBe(
      'Missing client id or secret: ID(true) Secret(false)'
    );
  });

  it('should reject missing client secret', async () => {
    // arrange
    delete process.env.USER_POOL_CLIENT_SECRET;

    // act
    let error;
    try {
      await generateClientSecretHash('test-username');
    } catch (error_) {
      error = error_;
    }

    // assert
    expect(error).toBeTruthy();
    expect((error as Error).message).toBe(
      'Missing client id or secret: ID(false) Secret(true)'
    );
  });
});
