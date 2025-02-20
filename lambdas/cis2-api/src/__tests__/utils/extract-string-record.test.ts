import { extractStringRecord } from '../../utils/extract-string-record';

test('converts object to string record', () => {
  const input = {
    key1: 'value',
    key2: undefined,
    key3: 4,
  };

  const expectedOutput = {
    key1: 'value',
    key3: '4',
  };

  expect(extractStringRecord(input)).toEqual(expectedOutput);
});
