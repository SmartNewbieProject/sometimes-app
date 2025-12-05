import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { fillInput, findByPlaceholder, findByText } from '../helpers/test-helpers';

/**
 * 인증/회원가입 관련 Page Object
 */
export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  private selectors = {
    phoneInput: '[placeholder*="전화번호"]',
    verificationCodeInput: '[placeholder*="인증번호"]',
    nameInput: '[placeholder*="이름"]',
    birthdateInput: '[placeholder*="생년월일"]',
    nicknameInput: '[placeholder*="닉네임"]',
    submitButton: 'text=다음',
    verifyButton: 'text=인증',
    agreeAllCheckbox: '[data-testid="agree-all-checkbox"]',
    termsCheckbox: '[data-testid="terms-checkbox"]',
    privacyCheckbox: '[data-testid="privacy-checkbox"]',
  };

  /**
   * 회원가입 페이지로 이동
   */
  async gotoSignup() {
    await this.goto('/signup');
  }

  /**
   * 로그인 페이지로 이동
   */
  async gotoLogin() {
    await this.goto('/login');
  }

  /**
   * 전화번호 입력
   */
  async enterPhoneNumber(phoneNumber: string) {
    await fillInput(this.page, this.selectors.phoneInput, phoneNumber);
  }

  /**
   * 인증번호 요청 버튼 클릭
   */
  async requestVerificationCode() {
    const verifyButton = await findByText(this.page, '인증');
    await verifyButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 인증번호 입력
   */
  async enterVerificationCode(code: string) {
    await fillInput(this.page, this.selectors.verificationCodeInput, code);
  }

  /**
   * 이름 입력
   */
  async enterName(name: string) {
    await fillInput(this.page, this.selectors.nameInput, name);
  }

  /**
   * 생년월일 입력
   */
  async enterBirthdate(birthdate: string) {
    await fillInput(this.page, this.selectors.birthdateInput, birthdate);
  }

  /**
   * 닉네임 입력
   */
  async enterNickname(nickname: string) {
    await fillInput(this.page, this.selectors.nicknameInput, nickname);
  }

  /**
   * 성별 선택
   */
  async selectGender(gender: '남성' | '여성') {
    const genderButton = await findByText(this.page, gender);
    await genderButton.click();
  }

  /**
   * 약관 전체 동의
   */
  async agreeToAllTerms() {
    const checkbox = this.page.locator(this.selectors.agreeAllCheckbox);
    await checkbox.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 개별 약관 동의
   */
  async agreeToTerms() {
    await this.page.locator(this.selectors.termsCheckbox).click();
    await this.page.waitForTimeout(300);
  }

  async agreeToPrivacy() {
    await this.page.locator(this.selectors.privacyCheckbox).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 다음 버튼 클릭
   */
  async clickNext() {
    const nextButton = await findByText(this.page, '다음');
    await nextButton.click();
    await this.waitForNavigation();
  }

  /**
   * 완료 버튼 클릭
   */
  async clickComplete() {
    const completeButton = await findByText(this.page, '완료');
    await completeButton.click();
    await this.waitForNavigation();
  }

  /**
   * 회원가입 완료 확인
   */
  async expectSignupComplete() {
    await expect(this.page).toHaveURL(/\/(home|main)/, { timeout: 10000 });
  }

  /**
   * 에러 메시지 확인
   */
  async expectErrorMessage(message: string) {
    const error = await findByText(this.page, message);
    await expect(error).toBeVisible({ timeout: 5000 });
  }

  /**
   * 전체 회원가입 플로우 실행
   */
  async completeSignupFlow(userData: {
    phoneNumber: string;
    verificationCode: string;
    name: string;
    birthdate: string;
    gender: '남성' | '여성';
    nickname: string;
  }) {
    // 1. 전화번호 인증
    await this.enterPhoneNumber(userData.phoneNumber);
    await this.requestVerificationCode();
    await this.enterVerificationCode(userData.verificationCode);
    await this.clickNext();

    // 2. 기본 정보 입력
    await this.enterName(userData.name);
    await this.enterBirthdate(userData.birthdate);
    await this.selectGender(userData.gender);
    await this.clickNext();

    // 3. 닉네임 입력
    await this.enterNickname(userData.nickname);
    await this.clickNext();

    // 4. 약관 동의
    await this.agreeToAllTerms();
    await this.clickComplete();

    // 5. 완료 확인
    await this.expectSignupComplete();
  }
}
