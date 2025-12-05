/**
 * Mixpanel 통합 인터페이스
 * 플랫폼에 따라 자동으로 적절한 구현 선택
 * - iOS/Android: mixpanel-react-native (mixpanel.native.ts)
 * - Web: mixpanel-browser (mixpanel.web.ts)
 *
 * Metro bundler가 플랫폼에 따라 .native.ts 또는 .web.ts 자동 선택
 */

export { mixpanelAdapter } from './mixpanel';
export type { MixpanelAdapter } from './types';
