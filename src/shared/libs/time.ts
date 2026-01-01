import i18next from 'i18next';

export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatLastLogin = (lastLogin: string | null | undefined): string => {
  if (!lastLogin) {
    return i18next.t('shareds.utils.last_login.more_than_3_days');
  }

  const now = new Date();
  const loginDate = new Date(lastLogin);

  if (Number.isNaN(loginDate.getTime())) {
    return i18next.t('shareds.utils.last_login.more_than_3_days');
  }

  const diffMs = now.getTime() - loginDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    return i18next.t('shareds.utils.last_login.just_now');
  }
  if (diffHours < 6) {
    return i18next.t('shareds.utils.last_login.hours_6');
  }
  if (diffHours < 12) {
    return i18next.t('shareds.utils.last_login.hours_12');
  }
  if (diffHours < 24) {
    return i18next.t('shareds.utils.last_login.day_1');
  }
  if (diffHours < 48) {
    return i18next.t('shareds.utils.last_login.day_2');
  }
  if (diffHours < 72) {
    return i18next.t('shareds.utils.last_login.day_3');
  }
  return i18next.t('shareds.utils.last_login.more_than_3_days');
};
