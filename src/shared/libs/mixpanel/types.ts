/**
 * Mixpanel 통합 인터페이스 타입 정의
 * 네이티브(mixpanel-react-native)와 웹(mixpanel-browser) 모두 지원
 */

export interface MixpanelAdapter {
  /**
   * Mixpanel 초기화
   * @param token - Mixpanel 프로젝트 토큰
   * @param trackAutomaticEvents - 자동 이벤트 추적 여부 (선택)
   */
  init(token: string, trackAutomaticEvents?: boolean): void;

  /**
   * 이벤트 추적
   * @param eventName - 이벤트 이름
   * @param properties - 이벤트 속성
   */
  track(eventName: string, properties?: Record<string, any>): void;

  /**
   * 사용자 식별
   * @param userId - 사용자 고유 ID
   */
  identify(userId: string): void;

  /**
   * 사용자 속성 설정
   * @param properties - 사용자 속성
   */
  setUserProperties(properties: Record<string, any>): void;

  /**
   * 사용자 식별 초기화 (로그아웃)
   */
  reset(): void;
}
