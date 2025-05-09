import { dayUtils } from "@shared/libs";

describe('DayUtils 테스트', () => {
  test('day 가 현재시간대로 출력된다.', () => {
    const dayjs = dayUtils.create();
    const test = dayjs.format('YYYY-MM-DD');
    console.log(`test: ${test}`);
  });

  test('getDayBy6Digit() 에서 날짜를 정상적으로 파싱한다.', () => {
    const day = dayUtils.getDayBy6Digit('700101');
    const test = day.format('YYYY-MM-DD');
    expect(test).toBe('1970-01-01');
  });

  test('relativeFomrat 에서 시간을 정상적으로 파싱한다.', () => {
    const test = dayUtils.formatRelativeTime('2025-05-09T11:11:29.578Z');
    console.log({ test });
  });
});
