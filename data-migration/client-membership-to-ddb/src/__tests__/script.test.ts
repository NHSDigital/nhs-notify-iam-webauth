const moduleName = '@/src/script';

const mockMigration = jest.fn();

jest.mock('@/src/migration/migration', () => ({
  runMigration: mockMigration,
}));

const mockErrorLogger = jest.fn();
jest.mock('@/src/utils/logger', () => ({
  logger: {
    error: mockErrorLogger,
  },
}));

describe('script', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('should execute migration as script main function', async () => {
    // arrange
    mockMigration.mockImplementation(async () => {});

    // act
    await import(moduleName);

    // assert
    expect(mockMigration).toHaveBeenCalledTimes(1);
  });

  test('should catch error', async () => {
    // arrange

    mockMigration.mockImplementation(async () => {
      throw new Error('Migration error');
    });

    // act
    await import(moduleName);

    // assert
    expect(mockErrorLogger).toHaveBeenCalledWith(
      'Migration failed',
      expect.any(Error)
    );
  });
});
