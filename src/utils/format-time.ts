'use client';

export const formatTime = (remainingSeconds: number) => {
  if (remainingSeconds <= 30) {
    return `${remainingSeconds} seconds`;
  }

  if (remainingSeconds <= 60) {
    return '1 minute';
  }

  return `${Math.ceil(remainingSeconds / 60)} minutes`;
};
