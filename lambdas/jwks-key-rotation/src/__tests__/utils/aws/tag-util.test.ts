import { getKeyTags } from '@/src/utils/aws/tag-util';

describe('tag-util', () => {
  const OLD_ENV = { ...process.env };
  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('getKeyTags', () => {
    test('should parse multiple key tags', () => {
      // arrange
      process.env.KEY_TAGS =
        'Component=abc,Environment=abcd12,Group=dev,Name=def,Project=NHS Notify';

      // act
      const result = getKeyTags();

      // assert
      expect(result).toMatchObject([
        { TagKey: 'Component', TagValue: 'abc' },
        { TagKey: 'Environment', TagValue: 'abcd12' },
        { TagKey: 'Group', TagValue: 'dev' },
        { TagKey: 'Name', TagValue: 'def' },
        { TagKey: 'Project', TagValue: 'NHS Notify' },
        { TagKey: 'Usage', TagValue: 'CIS2-JWKS-AUTH' },
      ]);
    });

    test('should parse a single key tag', () => {
      // arrange
      process.env.KEY_TAGS = 'Component=abc 123';

      // act
      const result = getKeyTags();

      // assert
      expect(result).toMatchObject([
        { TagKey: 'Component', TagValue: 'abc 123' },
        { TagKey: 'Usage', TagValue: 'CIS2-JWKS-AUTH' },
      ]);
    });

    test('should parse unset key tags', () => {
      // arrange
      delete process.env.KEY_TAGS;

      // act
      const result = getKeyTags();

      // assert
      expect(result).toMatchObject([
        { TagKey: 'Usage', TagValue: 'CIS2-JWKS-AUTH' },
      ]);
    });

    test('should parse empty key tags', () => {
      // arrange
      process.env.KEY_TAGS = '';

      // act
      const result = getKeyTags();

      // assert
      expect(result).toMatchObject([
        { TagKey: 'Usage', TagValue: 'CIS2-JWKS-AUTH' },
      ]);
    });

    test('should ignore empty tags', () => {
      // arrange
      process.env.KEY_TAGS = 'Component=abc 123,';

      // act
      const result = getKeyTags();

      // assert
      expect(result).toMatchObject([
        { TagKey: 'Component', TagValue: 'abc 123' },
        { TagKey: 'Usage', TagValue: 'CIS2-JWKS-AUTH' },
      ]);
    });

    test('should reject invalid comma separted list', () => {
      // arrange
      process.env.KEY_TAGS = '{"parameter1":"value1"}';

      // act
      let error;
      try {
        getKeyTags();
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe(
        'Invalid tags {"parameter1":"value1"}'
      );
    });

    test('should reject invalid parameter', () => {
      // arrange
      process.env.KEY_TAGS = 'Component=abc 123=';

      // act
      let error;
      try {
        getKeyTags();
      } catch (caughtError) {
        error = caughtError;
      }

      // assert
      expect(error).toBeTruthy();
      expect((error as Error).message).toBe(
        'Invalid tag parameter Component=abc 123='
      );
    });
  });
});
