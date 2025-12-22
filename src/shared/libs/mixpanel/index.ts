/**
 * Mixpanel 통합 인터페이스
 * 플랫폼에 따라 자동으로 적절한 구현 선택
 * - iOS/Android: index.native.ts → mixpanel.native.ts
 * - Web: index.web.ts → mixpanel.web.ts
 *
 * Metro bundler가 플랫폼에 따라 index.native.ts 또는 index.web.ts 자동 선택
 * 이 파일은 fallback으로만 사용됨
 */

export { mixpanelAdapter } from './mixpanel.native';
export type { MixpanelAdapter } from './types';
