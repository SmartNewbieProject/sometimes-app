import dayjs, { type ConfigType } from 'dayjs';
import 'dayjs/locale/ko';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import i18n from "@/src/shared/libs/i18n";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');
dayjs.tz.setDefault('Asia/Seoul');

const getDayBy6Digit = (digit: string) => {
  const now = create();
  const year = (() => {
    const prefix = Number(now.format('YYYY').slice(2, 4));
    const year = Number(digit.slice(0, 2));
    return year > prefix ? `19${year}` : `20${year < 10 ? `0${year}` : year}`;
  })();

  const month = digit.slice(2, 4);
  const day = digit.slice(4, 6);

  const isOverDayOfMonth = (() => {
    const d = now.set('month', Number(month) - 1);
    const dayOfMonths = d.endOf('month').date();
    return dayOfMonths < Number(day);
  })();

  if (isOverDayOfMonth) {
    throw new Error(i18n.t("shareds.hooks.day.date_not_exist"));
  }

  return create(`${year}-${month}-${day}`);
};

const getAgeBy6Digit = (digit: string) => {
  const day = getDayBy6Digit(digit);
  const now = create();
  return now.diff(day, 'year');
};

const formatRelativeTime = (stringDate: string) => {
  const target = create(stringDate);
  const now = create();

  const secondsDiff = now.diff(stringDate, 'seconds');
  const minutesDiff = now.diff(stringDate, 'minutes');
  const hoursDiff = now.diff(stringDate, 'hours');
  const daysDiff = now.diff(stringDate, 'days');

  if (secondsDiff < 0) return i18n.t("shareds.hooks.day.just_now");
  if (secondsDiff < 60) return i18n.t("shareds.hooks.day.seconds_ago", { seconds: secondsDiff });
  if (minutesDiff < 60) return i18n.t("shareds.hooks.day.minutes_ago", { minutes: minutesDiff });
  if (hoursDiff < 24) return i18n.t("shareds.hooks.day.hours_ago", { hours: hoursDiff });
  if (daysDiff < 8) return i18n.t("shareds.hooks.day.days_ago", { days: daysDiff });
  return target.format('MM/DD HH:mm');
};

const create = (config?: ConfigType) => {
  return dayjs(config).tz('Asia/Seoul');
};

const createUTC = (config?: ConfigType) =>
  dayjs(config).utc();

const dayUtils = {
  getDayBy6Digit,
  getAgeBy6Digit,
  create,
  formatRelativeTime,
  createUTC,
};

export default dayUtils;
