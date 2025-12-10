import { Page, expect } from '@playwright/test';

/**
 * E2E 테스트 헬퍼 함수 모음
 */

/**
 * 페이지 로드 대기 (React Native Web 초기화 대기)
 */
export async function waitForAppLoad(page: Page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForTimeout(1000); // React Native Web 초기화 대기
}

/**
 * 텍스트로 요소 찾기 (대소문자 구분 없음)
 */
export async function findByText(page: Page, text: string) {
  return page.locator(`text=${text}`).first();
}

/**
 * 테스트 ID로 요소 찾기
 */
export async function findByTestId(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"]`).first();
}

/**
 * placeholder로 입력 필드 찾기
 */
export async function findByPlaceholder(page: Page, placeholder: string) {
  return page.locator(`[placeholder*="${placeholder}"]`).first();
}

/**
 * 버튼 클릭 및 네비게이션 대기
 */
export async function clickAndWaitForNavigation(page: Page, selector: string) {
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click(selector)
  ]);
}

/**
 * 입력 필드에 텍스트 입력
 */
export async function fillInput(page: Page, selector: string, text: string) {
  await page.fill(selector, '');
  await page.fill(selector, text);
  await page.waitForTimeout(300); // 입력 안정화 대기
}

/**
 * 모달이 나타날 때까지 대기
 */
export async function waitForModal(page: Page, timeout = 5000) {
  await page.waitForSelector('[role="dialog"], .modal', { timeout });
}

/**
 * 토스트/스낵바 메시지 확인
 */
export async function expectToastMessage(page: Page, message: string) {
  const toast = page.locator(`text=${message}`).first();
  await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * 에러 메시지 확인
 */
export async function expectErrorMessage(page: Page, message: string) {
  const error = page.locator(`text=${message}`).first();
  await expect(error).toBeVisible({ timeout: 3000 });
}

/**
 * 로딩 완료 대기
 */
export async function waitForLoadingComplete(page: Page) {
  // 로딩 스피너가 사라질 때까지 대기
  await page.waitForSelector('[data-testid="loading"], .loading', {
    state: 'hidden',
    timeout: 10000
  }).catch(() => {
    // 로딩 요소가 없으면 무시
  });
}

/**
 * 스크롤하여 요소 보이게 하기
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
}

/**
 * 특정 URL 패턴으로 네비게이션 되었는지 확인
 */
export async function expectUrlPattern(page: Page, pattern: string | RegExp) {
  await expect(page).toHaveURL(pattern, { timeout: 5000 });
}

/**
 * 스크린샷 캡처 (디버깅용)
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test/e2e/test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  });
}

/**
 * React Native Web에서 버튼 찾기 (접근성 기반)
 */
export async function findButtonByLabel(page: Page, label: string) {
  return page.locator(`[role="button"]:has-text("${label}")`).first();
}

/**
 * 체크박스 토글
 */
export async function toggleCheckbox(page: Page, selector: string) {
  await page.locator(selector).click();
  await page.waitForTimeout(300);
}

/**
 * 드롭다운에서 옵션 선택
 */
export async function selectDropdownOption(page: Page, dropdownSelector: string, optionText: string) {
  await page.click(dropdownSelector);
  await page.waitForTimeout(300);
  await page.click(`text=${optionText}`);
}
