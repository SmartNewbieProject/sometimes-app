import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const getDayBy6Digit = (digit: string) => {
  const now = dayjs();
  const year = (() => {
    const prefix = now.format('YY');
    const year = digit.slice(0, 2);
    return year < prefix ? `19${year}` : `20${year}`;
  })();

  const month = digit.slice(2, 4);
  const day = digit.slice(4, 6);

  return dayjs(`${year}-${month}-${day}`);
};

const getAgeBy6Digit = (digit: string) => {
  const day = getDayBy6Digit(digit);
  const now = dayjs(new Date());
  console.log({ day: day.format('YYYY-MM-DD'), now: now.format('YYYY-MM-DD') });
  return now.diff(day, 'year');
};

const dayUtils = {
  getDayBy6Digit, 
  getAgeBy6Digit,
};

export default dayUtils;
