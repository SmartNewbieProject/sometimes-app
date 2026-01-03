/**
 * 앱 설치 유도 모달 타입 정의
 */

export type AppInstallPromptVariant = 'nav_click' | 'matching' | 'community';

export const STORAGE_KEYS = {
  NAV_CLICK_COUNT: 'app_install_prompt_nav_click_count',
  NAV_PROMPT_SHOWN: 'app_install_prompt_nav_shown',
} as const;
