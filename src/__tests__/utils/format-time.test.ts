import { formatTime } from '@/src/utils/format-time';

describe('formatTime', () => {
  test.each([
    {
      remainingTime: 121,
      expected: '3 minutes',
    },
    {
      remainingTime: 120,
      expected: '2 minutes',
    },
    {
      remainingTime: 61,
      expected: '2 minutes',
    },
    {
      remainingTime: 60,
      expected: '1 minute',
    },
    {
      remainingTime: 31,
      expected: '1 minute',
    },
    {
      remainingTime: 30,
      expected: '30 seconds',
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
