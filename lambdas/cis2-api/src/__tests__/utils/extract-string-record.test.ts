import { extractStringRecord } from '@/src/utils/extract-string-record';

describe('extract-string-record', () => {
  test('converts object to string record', () => {
    // arrange
    const input = {
      key1: 'value',
      key2: undefined,
      key3: 4,
      key4: null,
      key5: '',
      key6: ['value2', 'value3'],
      key7: true,
    };

    const expectedOutput = {
      key1: 'value',
      key3: '4',
      key6: 'value2,value3',
      key7: 'true',
    };

    // act
    const result = extractStringRecord(input);

    // assert
    expect(result).toEqual(expectedOutput);
  });
});
