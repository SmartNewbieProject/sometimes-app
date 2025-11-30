/**
 * 결제 트리거 컴포넌트 이름 상수
 * Sometimes 앱의 젬 기반 결제 모델에 맞게 정의
 */
export const PAYMENT_TRIGGER_COMPONENTS = {
  // 기능 제한 트리거
  'daily_match_exhausted_banner': 'Daily Match Exhausted Banner',
  'no_more_profiles_message': 'No More Profiles Message',
  'rematch_prompt': 'Rematch Prompt Button',
  'profile_open_gem_required': 'Profile Open Gem Required',
  'chat_gem_required': 'Chat Gem Required',
  'gift_sending_blocked': 'Gift Sending Blocked',

  // 직접 진입
  'main_menu_store_button': 'Main Menu Store Button',
  'gem_icon_header': 'Gem Icon Header',
  'gem_shortcut_button': 'Gem Shortcut Button',

  // 프로모션
  'discount_banner': 'Discount Banner',
  'limited_offer_popup': 'Limited Offer Popup',
  'seasonal_promotion': 'Seasonal Promotion',
  'first_sale_bonus': 'First Sale Bonus',

  // 커뮤니티 기능 제한
  'community_post_gem_required': 'Community Post Gem Required',
  'article_boost_gem_required': 'Article Boost Gem Required',

  // 매칭 기능 제한
  'super_match_gem_required': 'Super Match Gem Required',
  'profile_visibility_boost_gem_required': 'Profile Visibility Boost Gem Required',

  // 기타
  'onboarding_gems_purchase': 'Onboarding Gems Purchase',
  'settings_gems_button': 'Settings Gems Button',
  'gem_insufficient_modal': 'Gem Insufficient Modal',
} as const;

export type PaymentTriggerComponent = keyof typeof PAYMENT_TRIGGER_COMPONENTS;

/**
 * 컴포넌트 이름으로 사람이 읽기 쉬운 레이블 가져오기
 * @param componentName 컴포넌트 이름
 * @returns 사람이 읽기 쉬운 레이블
 */
export const getPaymentTriggerLabel = (componentName: string): string => {
  return PAYMENT_TRIGGER_COMPONENTS[componentName as PaymentTriggerComponent] || componentName;
};

/**
 * 모든 결제 트리거 컴포넌트 목록 가져오기
 * @returns 컴포넌트 이름 배열
 */
export const getAllPaymentTriggerComponents = (): PaymentTriggerComponent[] => {
  return Object.keys(PAYMENT_TRIGGER_COMPONENTS) as PaymentTriggerComponent[];
};

/**
 * 기능 제한 관련 트리거 컴포넌트 필터링
 * @returns 기능 제한 트리거 목록
 */
export const getFeatureLimitTriggers = (): PaymentTriggerComponent[] => {
  return getAllPaymentTriggerComponents().filter(key =>
    key.includes('_gem_required') ||
    key.includes('_exhausted') ||
    key.includes('_blocked')
  );
};

/**
 * 프로모션 관련 트리거 컴포넌트 필터링
 * @returns 프로모션 트리거 목록
 */
export const getPromotionalTriggers = (): PaymentTriggerComponent[] => {
  return getAllPaymentTriggerComponents().filter(key =>
    key.includes('discount') ||
    key.includes('limited') ||
    key.includes('seasonal') ||
    key.includes('bonus') ||
    key.includes('promotion')
  );
};