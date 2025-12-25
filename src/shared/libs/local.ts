import * as Localization from "expo-localization";

/**
 * ⚠️ 테스트용 언어 오버라이드
 *
 * JP 테스트: 'ja' 로 변경
 * KR 테스트: 'ko' 로 변경
 * 실제 기기 언어 사용: null 로 설정
 */
const TEST_LANGUAGE_OVERRIDE: "ja" | "ko" | null = null;
// const TEST_LANGUAGE_OVERRIDE: "ja" | "ko" | null = "ja"; // ← JP 테스트시 이 줄 사용

export function getUserLanguage(): string {
  if (TEST_LANGUAGE_OVERRIDE) {
    return TEST_LANGUAGE_OVERRIDE;
  }
  const deviceLocales = Localization.getLocales();
  return deviceLocales[0]?.languageCode || "ko";
}

export function isJapanese(): boolean {
  return getUserLanguage() === "ja";
}
