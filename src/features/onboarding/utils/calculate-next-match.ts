export const calculateNextMatchTime = (): Date => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  let daysUntilNext = 0;

  if (currentDay === 0) {
    if (currentHour < 21) {
      daysUntilNext = 0;
    } else {
      daysUntilNext = 4;
    }
  } else if (currentDay === 4) {
    if (currentHour < 21) {
      daysUntilNext = 0;
    } else {
      daysUntilNext = 3;
    }
  } else if (currentDay < 4) {
    daysUntilNext = 4 - currentDay;
  } else {
    daysUntilNext = 7 - currentDay;
  }

  const nextMatch = new Date(now);
  nextMatch.setDate(now.getDate() + daysUntilNext);
  nextMatch.setHours(21, 0, 0, 0);

  return nextMatch;
};

export const formatCountdown = (targetDate: Date): string => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return 'D-0일 0시간 0분';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `D-${days}일 ${hours}시간 ${minutes}분`;
};
