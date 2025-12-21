/**
 * Sometimes 앱 KPI 측정을 위한 Amplitude 이벤트 상수
 * AARRR 프레임워크 기반의 표준화된 이벤트 정의
 */

export const AMPLITUDE_KPI_EVENTS: Record<string, string> = {
  // 1. 사용자 온보딩 퍼널
  UNIVERSITY_VERIFICATION_STARTED: 'University_Verification_Started',
  UNIVERSITY_VERIFICATION_COMPLETED: 'University_Verification_Completed',
  PROFILE_COMPLETION_UPDATED: 'Profile_Completion_Updated',
  PROFILE_PHOTO_UPLOADED: 'Profile_Photo_Uploaded',
  ONBOARDING_STARTED: 'Onboarding_Started',
  ONBOARDING_COMPLETED: 'Onboarding_Completed',
  ONBOARDING_STEP_COMPLETED: 'Onboarding_Step_Completed',

  // 2. 매칭 효율성
  MATCH_REQUEST_SENT: 'Match_Request_Sent',
  MATCH_ACCEPTED: 'Match_Accepted',
  MATCH_REJECTED: 'Match_Rejected',
  FIRST_MESSAGE_SENT_AFTER_MATCH: 'First_Message_Sent_After_Match',
  MATCH_CONVERSATION_RATE: 'Match_Conversation_Rate',
  MATCH_CARD_VIEWED: 'Match_Card_Viewed',
  MATCH_TIME_TO_RESPONSE: 'Match_Time_To_Response',

  // 3. 커뮤니티 참여도
  ARTICLE_CREATED: 'Article_Created',
  ARTICLE_LIKED: 'Article_Liked',
  ARTICLE_COMMENTED: 'Article_Commented',
  ARTICLE_SHARED: 'Article_Shared',
  ARTICLE_VIEWED: 'Article_Viewed',
  COMMUNITY_DAILY_ACTIVE_USERS: 'Community_Daily_Active_Users',
  ARTICLE_BOOKMARKED: 'Article_Bookmarked',
  ARTICLE_REPORTED: 'Article_Reported',

  // 4. 결제 전환율
  PAYMENT_INITIATED: 'Payment_Initiated',
  PAYMENT_COMPLETED: 'Payment_Completed',
  PAYMENT_FAILED: 'Payment_Failed',
  PAYMENT_CANCELLED: 'Payment_Cancelled',
  REMATCH_PURCHASED: 'Rematch_Purchased',
  SUBSCRIPTION_STARTED: 'Subscription_Started',
  SUBSCRIPTION_RENEWED: 'Subscription_Renewed',
  SUBSCRIPTION_CANCELLED: 'Subscription_Cancelled',
  REVENUE_PER_USER: 'Revenue_Per_User',
  PAYMENT_METHOD_ADDED: 'Payment_Method_Added',
  PAYMENT_METHOD_REMOVED: 'Payment_Method_Removed',
  USER_METRICS_UPDATED: 'User_Metrics_Updated',

  // 기존 인증 관련 (Acquisition)
  AUTH_LOGIN_STARTED: 'Auth_Login_Started',
  AUTH_LOGIN_COMPLETED: 'Auth_Login_Completed',
  AUTH_LOGIN_FAILED: 'Auth_Login_Failed',
  AUTH_LOGOUT: 'Auth_Logout',

  // 회원 관리 관련 (Retention/Churn)
  ACCOUNT_DELETION_REQUESTED: 'Account_Deletion_Requested',
  ACCOUNT_DELETION_CANCELLED: 'Account_Deletion_Cancelled',
  ACCOUNT_DELETED: 'Account_Deleted',
  ACCOUNT_REACTIVATED: 'Account_Reactivated',

  // 좋아요 관련 (Engagement/Revenue)
  LIKE_SENT: 'Like_Sent',
  LIKE_RECEIVED: 'Like_Received',

  // 사용자 관리 관련 (Safety/Retention)
  USER_BLOCKED: 'User_Blocked',
  USER_REPORTED: 'User_Reported',

  // 회원가입 관련 (Acquisition → Activation)
  SIGNUP_STARTED: 'Signup_Started',
  SIGNUP_PROFILE_IMAGE_UPLOADED: 'Signup_Profile_Image_Uploaded',
  SIGNUP_INTEREST_SELECTED: 'Signup_Interest_Selected',
  SIGNUP_COMPLETED: 'Signup_Completed',

  // 매칭 관련 (Activation)
  MATCHING_STARTED: 'Matching_Started',
  MATCHING_PROFILE_VIEWED: 'Matching_Profile_Viewed',
  MATCHING_REQUESTED: 'Matching_Requested',
  MATCHING_SUCCESS: 'Matching_Success',
  MATCHING_FAILED: 'Matching_Failed',
  PROFILE_VIEWED: 'Profile_Viewed',
  FILTER_APPLIED: 'Filter_Applied',

  // 채팅 관련 (Activation → Retention)
  CHAT_STARTED: 'Chat_Started',
  CHAT_MESSAGE_SENT: 'Chat_Message_Sent',
  CHAT_ENDED: 'Chat_Ended',
  CHAT_GIFT_SENT: 'Chat_Gift_Sent',
  CHAT_RESPONSE: 'Chat_Response',
  CHAT_24H_ACTIVE: 'Chat_24h_Active',

  // 커뮤니티 관련 (Retention)
  COMMUNITY_POST_CREATED: 'Community_Post_Created',
  COMMUNITY_POST_VIEWED: 'Community_Post_Viewed',
  COMMUNITY_POST_LIKED: 'Community_Post_Liked',
  COMMUNITY_COMMENT_ADDED: 'Community_Comment_Added',
  COMMUNITY_POST_SHARED: 'Community_Post_Shared',
  COMMUNITY_FEED_VIEWED: 'Community_Feed_Viewed',
  COMMUNITY_POST_REPORTED: 'Community_Post_Reported',
  COMMUNITY_POST_DELETED: 'Community_Post_Deleted',

  // 결제 관련 (Revenue)
  PAYMENT_STORE_VIEWED: 'Payment_Store_Viewed',
  PAYMENT_ITEM_SELECTED: 'Payment_Item_Selected',
  PAYMENT_GEM_USED: 'Payment_Gem_Used',
  PAYMENT_TICKET_USED: 'Payment_Ticket_Used',

  // 모먼트 관련 (Retention)
  MOMENT_QUESTION_VIEWED: 'Moment_Question_Viewed',
  MOMENT_ANSWER_SUBMITTED: 'Moment_Answer_Submitted',
  MOMENT_ANSWER_SHARED: 'Moment_Answer_Shared',
  MOMENT_OTHER_ANSWERS_VIEWED: 'Moment_Other_Answers_Viewed',

  // 추천 관련 (Referral)
  REFERRAL_INVITE_SENT: 'Referral_Invite_Sent',
  REFERRAL_INVITE_ACCEPTED: 'Referral_Invite_Accepted',
  REFERRAL_SIGNUP_COMPLETED: 'Referral_Signup_Completed',
  REFERRAL_REWARD_GRANTED: 'Referral_Reward_Granted',
  INVITE_LINK_CLICKED: 'Invite_Link_Clicked',
  INVITE_CONVERSION_COMPLETED: 'Invite_Conversion_Completed',

  // 세션 관련 (Retention)
  SESSION_STARTED: 'Session_Started',
  SESSION_ENDED: 'Session_Ended',
  PUSH_NOTIFICATION_OPENED: 'Push_Notification_Opened',
  FIRST_SESSION_COMPLETED: 'First_Session_Completed',

  // 앱 사용 관련 (Retention)
  APP_OPENED: 'App_Opened',
  APP_BACKGROUNDED: 'App_Backgrounded',
  FEATURE_USED: 'Feature_Used',

  // 썸메이트(AI 채팅) 관련 (Retention/Engagement)
  SOMEMATE_SESSION_STARTED: 'Somemate_Session_Started',
  SOMEMATE_SESSION_COMPLETED: 'Somemate_Session_Completed',
  SOMEMATE_MESSAGE_SENT: 'Somemate_Message_Sent',
  SOMEMATE_MESSAGE_RECEIVED: 'Somemate_Message_Received',
  SOMEMATE_ANALYSIS_STARTED: 'Somemate_Analysis_Started',
  SOMEMATE_ANALYSIS_COMPLETED: 'Somemate_Analysis_Completed',
  SOMEMATE_REPORT_VIEWED: 'Somemate_Report_Viewed',
  SOMEMATE_REPORT_SHARED: 'Somemate_Report_Shared',
  SOMEMATE_CATEGORY_SELECTED: 'Somemate_Category_Selected',
  SOMEMATE_SESSION_ABANDONED: 'Somemate_Session_Abandoned',
  SOMEMATE_FEEDBACK_SUBMITTED: 'Somemate_Feedback_Submitted',
  SOMEMATE_FOLLOW_UP_QUESTION: 'Somemate_Follow_Up_Question',

  // 리텐션 관련 (Retention)
  REACTIVATION: 'Reactivation',
  FEATURE_ADOPTED: 'Feature_Adopted',
} as const;

// 인증 방법 Enum
export const AUTH_METHODS = {
  PASS: 'pass',
  KAKAO: 'kakao',
  APPLE: 'apple',
} as const;

// 로그아웃 사유 Enum
export const LOGOUT_REASONS = {
  MANUAL: 'manual',
  SESSION_EXPIRED: 'session_expired',
  ACCOUNT_DELETED: 'account_deleted',
} as const;

// 좋아요 타입 Enum
export const LIKE_TYPES = {
  FREE: 'free',
  SUPER: 'super',
} as const;

// 차단/신고 소스 Enum
export const USER_ACTION_SOURCES = {
  CHAT: 'chat',
  PROFILE: 'profile',
  COMMUNITY: 'community',
  MATCHING: 'matching',
} as const;

// 결제 방법 Enum
export const PAYMENT_METHODS = {
  CARD: 'card',
  KAKAO_PAY: 'kakao_pay',
  APPLE_PAY: 'apple_pay',
} as const;

// 매칭 타입 Enum
export const MATCHING_TYPES = {
  AUTO: 'auto',
  MANUAL: 'manual',
  REMATCH: 'rematch',
} as const;

// 콘텐츠 타입 Enum
export const CONTENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  GIFT: 'gift',
} as const;

// 이벤트 소스 Enum
export const EVENT_SOURCES = {
  PUSH: 'push',
  DEEP_LINK: 'deep_link',
  DIRECT: 'direct',
  NOTIFICATION: 'notification',
  SEARCH: 'search',
} as const;

// 썸메이트 카테고리 Enum
export const SOMEMATE_CATEGORIES = {
  DAILY: '일상',
  RELATIONSHIP: '인간관계',
  CAREER: '진로/학교',
  LOVE: '연애',
} as const;

// 썸메이트 세션 상태 Enum
export const SOMEMATE_SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CLOSED: 'closed',
} as const;

// 타입 정의
export type AuthMethod = typeof AUTH_METHODS[keyof typeof AUTH_METHODS];
export type LogoutReason = typeof LOGOUT_REASONS[keyof typeof LOGOUT_REASONS];
export type LikeType = typeof LIKE_TYPES[keyof typeof LIKE_TYPES];
export type UserActionSource = typeof USER_ACTION_SOURCES[keyof typeof USER_ACTION_SOURCES];
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
export type MatchingType = typeof MATCHING_TYPES[keyof typeof MATCHING_TYPES];
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
export type EventSource = typeof EVENT_SOURCES[keyof typeof EVENT_SOURCES];
export type SomemateCategory = typeof SOMEMATE_CATEGORIES[keyof typeof SOMEMATE_CATEGORIES];
export type SomemateSessionStatus = typeof SOMEMATE_SESSION_STATUS[keyof typeof SOMEMATE_SESSION_STATUS];

// 이벤트 속성 타입 정의
export interface BaseEventProperties {
  env?: string;
  timestamp?: number;
  session_id?: string;
  source?: EventSource;
}

// 인증 이벤트 속성
export interface AuthEventProperties extends BaseEventProperties {
  auth_method?: AuthMethod;
  login_duration?: number;
  error_type?: string;
}

// 로그아웃 이벤트 속성
export interface LogoutEventProperties extends BaseEventProperties {
  reason: LogoutReason;
}

// 회원 탈퇴 이벤트 속성
export interface AccountDeletionEventProperties extends BaseEventProperties {
  deletion_reason?: 'dissatisfaction' | 'goal_achieved' | 'price' | 'privacy' | 'inactivity' | 'found_match' | 'other';
  deletion_reason_detail?: string;
  days_since_signup?: number;
  total_matches_count?: number;
  has_purchased?: boolean;
  total_spent?: number;
  last_active_days_ago?: number;
  user_tier?: 'new' | 'active' | 'dormant';
}

// 좋아요 이벤트 속성
export interface LikeEventProperties extends BaseEventProperties {
  target_profile_id?: string;
  source_profile_id?: string;
  like_type?: LikeType;
}

// 사용자 차단/신고 이벤트 속성
export interface UserActionEventProperties extends BaseEventProperties {
  blocked_user_id?: string;
  reported_user_id?: string;
  reason: string;
  action_source?: UserActionSource;
}

// 가입 이벤트 속성
export interface SignupEventProperties extends BaseEventProperties {
  source?: EventSource;
  image_count?: number;
  profile_completion_rate?: number;
  total_duration?: number;
  category?: string;
  selection_count?: number;
}

// 매칭 이벤트 속성
export interface MatchingEventProperties extends BaseEventProperties {
  matching_type?: MatchingType;
  profile_id?: string;
  gem_cost?: number;
  view_duration?: number;
  time_to_match?: number;
  filters_applied?: string[];
  error_reason?: string;
  retry_available_at?: string;
  failure_category?: 'PAYMENT' | 'PERMISSION' | 'USAGE' | 'SYSTEM';
  is_recoverable?: boolean;
}

// 프로필 조회 이벤트 속성
export interface ProfileViewedEventProperties extends BaseEventProperties {
  viewed_profile_id: string;
  view_source: 'matching_history' | 'post_box' | 'chat' | 'direct';
  partner_age?: number;
  partner_university?: string;
}

// 필터 적용 이벤트 속성
export interface FilterAppliedEventProperties extends BaseEventProperties {
  filter_type: 'avoid_university' | 'avoid_department';
  filter_value: boolean;
  previous_value: boolean;
}

// 채팅 이벤트 속성
export interface ChatEventProperties extends BaseEventProperties {
  chat_partner_id?: string;
  chat_id?: string;
  message_type?: ContentType;
  chat_duration?: number;
  message_count?: number;
  end_reason?: string;
  gift_type?: string;
  is_first_message?: boolean;
}

// 채팅 24시간 활성화 이벤트 속성
export interface Chat24hActiveEventProperties extends BaseEventProperties {
  chat_room_id: string;
  match_id: string;
  chat_partner_id?: string;
  is_active: boolean;
  is_mutual_conversation: boolean;
  activity_status: 'inactive' | 'active' | 'mutual' | 'one_sided';
  my_message_count?: number;
  partner_message_count?: number;
  total_message_count?: number;
  first_response_time?: number;
  tracking_source: 'batch' | 'app';
}

// 커뮤니티 이벤트 속성
export interface CommunityEventProperties extends BaseEventProperties {
  post_id?: string;
  category?: string;
  has_image?: boolean;
  view_duration?: number;
  comment_length?: number;
  share_platform?: string;
}

// 결제 이벤트 속성
export interface PaymentEventProperties extends BaseEventProperties {
  store_type?: string;
  item_type?: string;
  item_value?: number;
  payment_method?: PaymentMethod;
  total_amount?: number;
  transaction_id?: string;
  items_purchased?: { type: string; quantity: number; price: number }[];
  usage_type?: string;
  gem_count?: number;
  error_reason?: string;
}

// 모먼트 이벤트 속성
export interface MomentEventProperties extends BaseEventProperties {
  question_id?: string;
  question_category?: string;
  answer_type?: string;
  time_to_answer?: number;
  share_platform?: string;
  answers_viewed?: number;
}

// 추천 이벤트 속성
export interface ReferralEventProperties extends BaseEventProperties {
  invite_method?: string;
  referrer_id?: string;
  invite_code?: string;
}

// 초대 링크 이벤트 속성
export interface InviteLinkEventProperties extends BaseEventProperties {
  invite_code: string;
  inviter_id?: string;
  invited_user_id?: string;
  referrer?: string;
  device_type?: 'ios' | 'android' | 'web';
  click_id?: string;
  signup_method?: string;
}

// 세션 이벤트 속성
export interface SessionEventProperties extends BaseEventProperties {
  session_duration?: number;
  session_start_reason?: string;
  notification_type?: string;
  app_version?: string;
}

// 기능 사용 이벤트 속성
export interface FeatureEventProperties extends BaseEventProperties {
  feature_name?: string;
  feature_category?: string;
  usage_duration?: number;
}

// 썸메이트 이벤트 속성
export interface SomemateEventProperties extends BaseEventProperties {
  session_id?: string;
  category?: SomemateCategory;
  turn_count?: number;
  message_type?: 'text' | 'analysis' | 'report';
  message_length?: number;
  analysis_duration?: number;
  report_id?: string;
  report_category?: string;
  share_platform?: string;
  question_type?: string;
  answer_type?: string;
  response_time?: number;
  satisfaction_score?: number;
}

// 이벤트 타입별 속성 매핑
export interface KpiEventTypePropertiesMap {
  // 사용자 온보딩 퍼널
  University_Verification_Started: SignupEventProperties;
  University_Verification_Completed: SignupEventProperties;
  Profile_Completion_Updated: SignupEventProperties;
  Profile_Photo_Uploaded: SignupEventProperties;
  Onboarding_Started: BaseEventProperties;
  Onboarding_Completed: SignupEventProperties;
  Onboarding_Step_Completed: SignupEventProperties;

  // 매칭 효율성
  Match_Request_Sent: MatchingEventProperties;
  Match_Accepted: MatchingEventProperties;
  Match_Rejected: MatchingEventProperties;
  First_Message_Sent_After_Match: ChatEventProperties;
  Match_Conversation_Rate: MatchingEventProperties;
  Match_Card_Viewed: MatchingEventProperties;
  Match_Time_To_Response: MatchingEventProperties;

  // 커뮤니티 참여도
  Article_Created: CommunityEventProperties;
  Article_Liked: CommunityEventProperties;
  Article_Commented: CommunityEventProperties;
  Article_Shared: CommunityEventProperties;
  Article_Viewed: CommunityEventProperties;
  Community_Daily_Active_Users: BaseEventProperties;
  Article_Bookmarked: CommunityEventProperties;
  Article_Reported: CommunityEventProperties;

  // 결제 전환율
  Payment_Initiated: PaymentEventProperties;
  Payment_Completed: PaymentEventProperties;
  Payment_Failed: PaymentEventProperties;
  Payment_Cancelled: PaymentEventProperties;
  Rematch_Purchased: PaymentEventProperties;
  Subscription_Started: PaymentEventProperties;
  Subscription_Renewed: PaymentEventProperties;
  Subscription_Cancelled: PaymentEventProperties;
  Revenue_Per_User: PaymentEventProperties;
  Payment_Method_Added: PaymentEventProperties;
  Payment_Method_Removed: PaymentEventProperties;

  // 인증 관련
  Auth_Login_Started: AuthEventProperties;
  Auth_Login_Completed: AuthEventProperties;
  Auth_Login_Failed: AuthEventProperties;
  Auth_Logout: LogoutEventProperties;

  // 회원 관리 관련
  Account_Deletion_Requested: AccountDeletionEventProperties;
  Account_Deletion_Cancelled: AccountDeletionEventProperties;
  Account_Deleted: AccountDeletionEventProperties;
  Account_Reactivated: BaseEventProperties;

  // 좋아요 관련
  Like_Sent: LikeEventProperties;
  Like_Received: LikeEventProperties;

  // 사용자 차단/신고 관련
  User_Blocked: UserActionEventProperties;
  User_Reported: UserActionEventProperties;

  // 가입 관련
  Signup_Started: SignupEventProperties;
  Signup_Profile_Image_Uploaded: SignupEventProperties;
  Signup_Interest_Selected: SignupEventProperties;
  Signup_Completed: SignupEventProperties;

  // 매칭 관련
  Matching_Started: MatchingEventProperties;
  Matching_Profile_Viewed: MatchingEventProperties;
  Matching_Requested: MatchingEventProperties;
  Matching_Success: MatchingEventProperties;
  Matching_Failed: MatchingEventProperties;
  Profile_Viewed: ProfileViewedEventProperties;
  Filter_Applied: FilterAppliedEventProperties;

  // 채팅 관련
  Chat_Started: ChatEventProperties;
  Chat_Message_Sent: ChatEventProperties;
  Chat_Ended: ChatEventProperties;
  Chat_Gift_Sent: ChatEventProperties;
  Chat_24h_Active: Chat24hActiveEventProperties;

  // 커뮤니티 관련
  Community_Post_Created: CommunityEventProperties;
  Community_Post_Viewed: CommunityEventProperties;
  Community_Post_Liked: CommunityEventProperties;
  Community_Comment_Added: CommunityEventProperties;
  Community_Post_Shared: CommunityEventProperties;

  // 결제 관련 (추가)
  Payment_Store_Viewed: PaymentEventProperties;
  Payment_Item_Selected: PaymentEventProperties;
  Payment_Gem_Used: PaymentEventProperties;
  Payment_Ticket_Used: PaymentEventProperties;

  // 모먼트 관련
  Moment_Question_Viewed: MomentEventProperties;
  Moment_Answer_Submitted: MomentEventProperties;
  Moment_Answer_Shared: MomentEventProperties;
  Moment_Other_Answers_Viewed: MomentEventProperties;

  // 추천 관련
  Referral_Invite_Sent: ReferralEventProperties;
  Referral_Invite_Accepted: ReferralEventProperties;
  Referral_Signup_Completed: ReferralEventProperties;
  Invite_Link_Clicked: InviteLinkEventProperties;
  Invite_Conversion_Completed: InviteLinkEventProperties;

  // 세션 관련
  Session_Started: SessionEventProperties;
  Session_Ended: SessionEventProperties;
  Push_Notification_Opened: SessionEventProperties;

  // 앱 사용 관련
  App_Opened: BaseEventProperties;
  App_Backgrounded: BaseEventProperties;
  Feature_Used: FeatureEventProperties;

  // 썸메이트 관련
  Somemate_Session_Started: SomemateEventProperties;
  Somemate_Session_Completed: SomemateEventProperties;
  Somemate_Message_Sent: SomemateEventProperties;
  Somemate_Message_Received: SomemateEventProperties;
  Somemate_Analysis_Started: SomemateEventProperties;
  Somemate_Analysis_Completed: SomemateEventProperties;
  Somemate_Report_Viewed: SomemateEventProperties;
  Somemate_Report_Shared: SomemateEventProperties;
  Somemate_Category_Selected: SomemateEventProperties;

  // 다른 모든 이벤트들도 기본 BaseEventProperties 사용
  [key: string]: BaseEventProperties;
}