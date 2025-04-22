import { dayUtils } from "@shared/libs";

describe('생년월일 테스트', () => {
  test('6자리 생년월일이 정상적으로 파싱된다.', () => {
    const birthday = '000627';
    const day = dayUtils.getDayBy6Digit(birthday);
    expect(day.format('YYYY-MM-DD')).toBe('2000-06-27');
  });

  test("날짜 범위가 해당 달의 마지막날에 벗어나면 오류가 발생한다.", () => {
    const birthday = '000232';
    expect(() => {
      dayUtils.getDayBy6Digit(birthday);
    }).toThrow("날짜가 존재하지 않습니다.");
  });
});
