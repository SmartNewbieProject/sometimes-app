export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatLastLogin = (lastLogin: string | null | undefined): string => {
  if (!lastLogin) {
    return '3일 이상';
  }

  const now = new Date();
  const loginDate = new Date(lastLogin);

  if (Number.isNaN(loginDate.getTime())) {
    return '3일 이상';
  }

  const diffMs = now.getTime() - loginDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    return '방금 전';
  }
  if (diffHours < 6) {
    return '6시간 전';
  }
  if (diffHours < 12) {
    return '12시간 전';
  }
  if (diffHours < 24) {
    return '1일 전';
  }
  if (diffHours < 48) {
    return '2일 전';
  }
  if (diffHours < 72) {
    return '3일 전';
  }
  return '3일 이상';
};
