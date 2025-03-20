export const formatTime = (remainingSeconds: number) => {
  const remainingMinutes = Math.round(remainingSeconds / 60);

  if (remainingMinutes <= 0) {
    return `${remainingSeconds} seconds`;
  }

  if (remainingMinutes <= 1) {
    return '1 minute';
  }

  return `${remainingMinutes} minutes`;
};
