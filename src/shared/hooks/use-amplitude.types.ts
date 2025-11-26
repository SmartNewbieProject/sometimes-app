import { AmplitudeEventValues } from '@/src/shared/constants/amplitude-events';

// 기본 이벤트 파라미터 타입
export interface BaseEventProperties {
  env?: string;
  timestamp?: number;
  app_version?: string;
  [key: string]: any;
}

// 특정 이벤트별 세부 파라미터 타입
export interface SignupEventProperties extends BaseEventProperties {
  platform?: 'pass' | 'kakao' | 'apple';
  success?: boolean;
  error?: string;
  image_index?: number;
  phone?: string;
  birthday?: string;
}

export interface PaymentEventProperties extends BaseEventProperties {
  who?: string;
  result?: any;
  amount?: number;
}

export interface UserBehaviorEventProperties extends BaseEventProperties {
  type?: 'modal';
}

export interface AmplitudeTrackOptions {
  immediate?: boolean;
  validate?: boolean;
}

// 이벤트 타입별 파라미터 매핑
export interface EventTypePropertiesMap {
  // 회원가입 관련
  Signup_Init: SignupEventProperties;
  Signup_Route_Entered: SignupEventProperties;
  Signup_university: SignupEventProperties;
  Singup_university_details: SignupEventProperties;
  Signup_profile_image: SignupEventProperties;
  Signup_profile_image_error: SignupEventProperties;
  Signup_profile_invite_code_error: SignupEventProperties;
  Signup_AgeCheck_Failed: SignupEventProperties;
  Signup_PhoneBlacklist_Failed: SignupEventProperties;
  Signup_Error: SignupEventProperties;
  signup_complete: SignupEventProperties;
  image_upload: SignupEventProperties;

  // 결제 관련
  GemStore_FirstSale_7: PaymentEventProperties;
  GemStore_FirstSale_16: PaymentEventProperties;
  GemStore_FirstSale_27: PaymentEventProperties;
  GemStore_Payment_Success: PaymentEventProperties;

  // 사용자 행동
  Interest_Hold: UserBehaviorEventProperties;
  Interest_Started: UserBehaviorEventProperties;
  Profile_Started: UserBehaviorEventProperties;
}

// KPI 이벤트 타입별 속성 매핑 (기본 타입들)
export interface KpiEventTypePropertiesMap {
  // 기본 이벤트들을 위한 플레이스홀더
  [key: string]: BaseEventProperties;
}

// KPI 이벤트 키 타입 (amplitude-kpi-events에서 가져옴)
export type KpiEventKey = keyof any; // keyof typeof AMPLITUDE_KPI_EVENTS와 동일하게 처리

// 훅 반환 타입
export interface UseAmplitudeReturn {
  trackEvent: <T extends AmplitudeEventValues>(
    eventName: T,
    properties?: EventTypePropertiesMap[T],
    options?: AmplitudeTrackOptions
  ) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  identifyUser: (userId: string) => void;
}