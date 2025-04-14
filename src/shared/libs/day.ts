import dayjs, { ConfigType } from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const getDayBy6Digit = (digit: string) => {
  const now = create();
  const year = (() => {
    console.log(now.format('YYYY'));
    const prefix = Number(now.format('YYYY').slice(2, 4));
    const year = Number(digit.slice(0, 2));
    console.log({ prefix, year });
    return year > prefix ? `19${year}` : `20${year}`;
  })();

  const month = digit.slice(2, 4);
  const day = digit.slice(4, 6);

  return dayjs(`${year}-${month}-${day}`);
};

const getAgeBy6Digit = (digit: string) => {
  const day = getDayBy6Digit(digit);
  const now = dayjs(new Date());
  return now.diff(day, 'year');
};

const create = (config?: ConfigType) =>
  dayjs(config);

const dayUtils = {
  getDayBy6Digit, 
  getAgeBy6Digit,
  create,
};

export default dayUtils;
