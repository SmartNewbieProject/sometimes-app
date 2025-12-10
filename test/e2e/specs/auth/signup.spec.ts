import { test, expect } from '@playwright/test';
import { AuthPage } from '../../pages';
import { TEST_USERS } from '../../fixtures/test-data';

test.describe('회원가입 플로우', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.gotoSignup();
  });

  test('신규 사용자 회원가입 완료', async () => {
    // Given: 회원가입 페이지에 접근
    await expect(authPage['page']).toHaveURL(/\/signup/);

    // When: 회원가입 정보 입력
    await authPage.completeSignupFlow({
      ...TEST_USERS.newUser,
      nickname: `테스터${Date.now()}`, // 닉네임 중복 방지
    });

    // Then: 홈 화면으로 이동
    await authPage.expectSignupComplete();
  });

  test('전화번호 인증 단계', async () => {
    // Given: 회원가입 페이지
    const { phoneNumber, verificationCode } = TEST_USERS.newUser;

    // When: 전화번호 입력 및 인증
    await authPage.enterPhoneNumber(phoneNumber);
    await authPage.requestVerificationCode();

    // Then: 인증번호 입력 필드 표시
    await expect(
      authPage['page'].locator('[placeholder*="인증번호"]')
    ).toBeVisible();

    // When: 인증번호 입력
    await authPage.enterVerificationCode(verificationCode);
    await authPage.clickNext();

    // Then: 다음 단계로 이동
    await authPage.waitForNavigation();
  });

  test('기본 정보 입력 단계', async () => {
    // Given: 전화번호 인증 완료 후
    await authPage.enterPhoneNumber(TEST_USERS.newUser.phoneNumber);
    await authPage.requestVerificationCode();
    await authPage.enterVerificationCode(TEST_USERS.newUser.verificationCode);
    await authPage.clickNext();

    // When: 기본 정보 입력
    await authPage.enterName(TEST_USERS.newUser.name);
    await authPage.enterBirthdate(TEST_USERS.newUser.birthdate);
    await authPage.selectGender(TEST_USERS.newUser.gender);
    await authPage.clickNext();

    // Then: 다음 단계로 이동
    await authPage.waitForNavigation();
  });

  test('닉네임 입력 단계', async () => {
    // Given: 기본 정보 입력 완료 후
    // (이전 단계 생략 - 직접 닉네임 페이지로 이동하거나 mock 사용)

    // When: 닉네임 입력
    const uniqueNickname = `테스터${Date.now()}`;
    await authPage.enterNickname(uniqueNickname);
    await authPage.clickNext();

    // Then: 약관 동의 페이지로 이동
    await authPage.waitForNavigation();
  });

  test('약관 동의 단계', async () => {
    // Given: 닉네임 입력 완료 후

    // When: 전체 약관 동의
    await authPage.agreeToAllTerms();
    await authPage.clickComplete();

    // Then: 회원가입 완료
    await authPage.expectSignupComplete();
  });

  test('잘못된 전화번호 형식 에러', async () => {
    // When: 잘못된 형식의 전화번호 입력
    await authPage.enterPhoneNumber('123');
    await authPage.requestVerificationCode();

    // Then: 에러 메시지 표시
    await authPage.expectErrorMessage('올바른 전화번호 형식이 아닙니다');
  });

  test('잘못된 인증번호 에러', async () => {
    // Given: 전화번호 입력 및 인증번호 요청
    await authPage.enterPhoneNumber(TEST_USERS.newUser.phoneNumber);
    await authPage.requestVerificationCode();

    // When: 잘못된 인증번호 입력
    await authPage.enterVerificationCode('999999');
    await authPage.clickNext();

    // Then: 에러 메시지 표시
    await authPage.expectErrorMessage('인증번호가 일치하지 않습니다');
  });
});
