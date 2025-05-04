import dayjs, { ConfigType } from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

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
    throw new Error("날짜가 존재하지 않습니다.");
  }

  return dayjs(`${year}-${month}-${day}`);
};

const getAgeBy6Digit = (digit: string) => {
  const day = getDayBy6Digit(digit);
  const now = dayjs(new Date());
  return now.diff(day, 'year');
};

const formatRelativeTime = (stringDate: string) => {
  const target = create(stringDate);
  const now = create();
  const minutesDiff = target.diff(now, 'minutes');
  const secondsDiff = target.diff(now, 'seconds');
  // console.log({
  //   target: target.format('YYYY-MM-DD HH:mm:ss'),
  //   now: now.format('YYYY-MM-DD HH:mm:ss'),
  //   minutesDiff,
  //   secondsDiff,
  // })

  if (secondsDiff >= 0 && secondsDiff < 60) return '방금 전';
  if (minutesDiff > 0 && minutesDiff < 60) return `${minutesDiff}분 전`;

  const hoursDiff = target.diff(now, 'hours');
  if (hoursDiff > 0 && hoursDiff < 24) return `${hoursDiff}시간 전`;
  const daysDiff = target.diff(now, 'days');
  if (daysDiff > 0 && daysDiff < 8) return `${daysDiff}일 전`;

  return target.format('MM/DD HH:mm');
};

const create = (config?: ConfigType) =>
  dayjs(config);

const dayUtils = {
  getDayBy6Digit,
  getAgeBy6Digit,
  create,
  formatRelativeTime,
};

export default dayUtils;
