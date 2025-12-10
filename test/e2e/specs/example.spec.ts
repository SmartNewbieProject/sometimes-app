import { test, expect } from '@playwright/test';

test.describe('Playwright 설치 확인', () => {
  test('기본 테스트 - example.com', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
    await expect(page.locator('h1')).toContainText('Example Domain');
  });

  test('기본 테스트 - Google', async ({ page }) => {
    await page.goto('https://www.google.com');
    await expect(page).toHaveTitle(/Google/);
  });
});
