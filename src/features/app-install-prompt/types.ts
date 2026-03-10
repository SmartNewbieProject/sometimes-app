/**
 * 앱 설치 유도 모달 타입 정의
 */

export type AppInstallPromptVariant = 'nav_click' | 'matching' | 'community';

export const STORAGE_KEYS = {
	NAV_CLICK_COUNT: 'app_install_prompt_nav_click_count',
	NAV_PROMPT_SHOWN: 'app_install_prompt_nav_shown',
	NAV_LAST_SHOWN: 'app_install_prompt_nav_last_shown',
	COMMUNITY_LAST_SHOWN: 'app_install_prompt_community_last_shown',
	MATCHING_LAST_SHOWN: 'app_install_prompt_matching_last_shown',
} as const;

export const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24시간
