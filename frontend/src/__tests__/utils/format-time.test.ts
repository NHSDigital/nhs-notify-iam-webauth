import { formatTime } from '@/src/utils/format-time';

describe('formatTime', () => {
  test.each([
    {
      remainingTime: 150,
      expected: '3 minutes',
    },
    {
      remainingTime: 149, // upper bound of 2 minutes
      expected: '2 minutes',
    },
    {
      remainingTime: 90,
      expected: '2 minutes',
    },
    {
      remainingTime: 89, // upper bound of 1 minute
      expected: '1 minute',
    },
    {
      remainingTime: 30,
      expected: '1 minute',
    },
    {
      remainingTime: 29, // upper bound of seconds
      expected: '29 seconds',
    },
    {
      remainingTime: 1,
      expected: '1 seconds',
    },
  ])(
    'should return $expected for $remainingTime seconds',
    ({ remainingTime, expected }) => {
      expect(formatTime(remainingTime)).toBe(expected);
    }
  );
});
