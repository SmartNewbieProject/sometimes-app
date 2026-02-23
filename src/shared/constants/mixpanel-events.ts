/**
 * Sometimes 앱 Mixpanel 이벤트 상수
 * AARRR 프레임워크 기반의 표준화된 이벤트 정의
 */

export const MIXPANEL_EVENTS: Record<string, string> = {
	// ===== 일반 이벤트 (구 AMPLITUDE_EVENTS) =====
	// 회원가입 퍼널 - View 이벤트 (화면 진입)
	SIGNUP_LOGIN_VIEW: 'Signup_Login_View',
	SIGNUP_AUTH_STARTED: 'Signup_Auth_Started',
	SIGNUP_UNIVERSITY_VIEW: 'Signup_University_View',
	SIGNUP_DETAILS_VIEW: 'Signup_Details_View',
	SIGNUP_INSTAGRAM_VIEW: 'Signup_Instagram_View',
	SIGNUP_PROFILE_VIEW: 'Signup_Profile_View',
	SIGNUP_INVITE_CODE_VIEW: 'Signup_InviteCode_View',

	// 회원가입 퍼널 - 완료 이벤트
	SIGNUP_ROUTE_ENTERED: 'Signup_Route_Entered',
	SIGNUP_UNIVERSITY: 'Signup_university',
	SIGNUP_DETAILS_DONE: 'Signup_Details_Done',
	SIGNUP_INSTAGRAM_ENTERED: 'Signup_instagram_entered',
	SIGNUP_INSTAGRAM_SKIPPED: 'Signup_instagram_skipped',
	SIGNUP_INVITE_CODE_DONE: 'Signup_InviteCode_Done',
	SIGNUP_INVITE_CODE_SKIPPED: 'Signup_InviteCode_Skipped',

	// 나이/인증 관련
	SIGNUP_AGE_CHECK_FAILED: 'Signup_AgeCheck_Failed',
	SIGNUP_PHONE_BLACKLIST_FAILED: 'Signup_PhoneBlacklist_Failed',
	SIGNUP_UNIVERSITY_NOT_FOUND: 'Signup_University_Not_Found',
	SIGNUP_UNIVERSITY_ABANDONED: 'Signup_University_Abandoned',
	SIGNUP_ERROR: 'Signup_Error',

	// 인증 퍼널 상세 추적 (2025-01-10 추가)
	// 외부 앱 이동/복귀 추적
	AUTH_EXTERNAL_APP_OPENED: 'Auth_External_App_Opened',
	AUTH_EXTERNAL_APP_RETURNED: 'Auth_External_App_Returned',
	AUTH_EXTERNAL_APP_NOT_RETURNED: 'Auth_External_App_Not_Returned',

	// 본인인증 완료
	SIGNUP_IDENTITY_VERIFICATION_COMPLETED: 'Signup_IdentityVerification_Completed',

	// 인증 방법 선택/변경
	AUTH_METHOD_SELECTED: 'Auth_Method_Selected',
	AUTH_METHOD_SWITCHED: 'Auth_Method_Switched',

	// 인증 재시도
	AUTH_RETRY_ATTEMPTED: 'Auth_Retry_Attempted',

	// 차단 원인 상세
	SIGNUP_AGE_RESTRICTION_BLOCKED: 'Signup_Age_Restriction_Blocked',
	SIGNUP_BLACKLIST_BLOCKED: 'Signup_Blacklist_Blocked',

	// 인증 에러 상세
	AUTH_VERIFICATION_ERROR: 'Auth_Verification_Error',

	// 관심사/프로필 관련
	INTEREST_HOLD: 'Interest_Hold',
	INTEREST_STARTED: 'Interest_Started',
	PROFILE_STARTED: 'Profile_Started',

	// 인앱 리뷰 관련
	IN_APP_REVIEW_ELIGIBLE: 'InAppReview_Eligible',
	IN_APP_REVIEW_PRE_PROMPT_SHOWN: 'InAppReview_PrePromptShown',
	IN_APP_REVIEW_PRE_PROMPT_RESPONSE: 'InAppReview_PrePromptResponse',
	IN_APP_REVIEW_REQUESTED: 'InAppReview_Requested',

	// 미호 멘트 관련
	MIHO_MESSAGE_SHOWN: 'Miho_Message_Shown',

	// ===== KPI 측정 이벤트 =====
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
	FIRST_MESSAGE_SENT_AFTER_MATCH: 'First_Message_Sent_After_Match',
	MATCH_CONVERSATION_RATE: 'Match_Conversation_Rate',
	MATCH_CARD_VIEWED: 'Match_Card_Viewed',
	MATCH_TIME_TO_RESPONSE: 'Match_Time_To_Response',

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

	// 기존 인증 관련 (Acquisition)
	AUTH_LOGIN_STARTED: 'Auth_Login_Started',
	AUTH_LOGIN_COMPLETED: 'Auth_Login_Completed',
	AUTH_LOGIN_FAILED: 'Auth_Login_Failed',
	AUTH_LOGIN_ABANDONED: 'Auth_Login_Abandoned',
	AUTH_LOGOUT: 'Auth_Logout',

	// 회원 관리 관련 (Retention/Churn)
	ACCOUNT_DELETION_REQUESTED: 'Account_Deletion_Requested',
	ACCOUNT_DELETION_CANCELLED: 'Account_Deletion_Cancelled',
	ACCOUNT_DELETED: 'Account_Deleted',
	ACCOUNT_REACTIVATED: 'Account_Reactivated',

	// 좋아요 관련 (Engagement/Revenue)
	LIKE_SENT: 'Like_Sent',
	LIKE_RECEIVED: 'Like_Received',
	LIKE_LIST_VIEWED: 'Like_List_Viewed',
	LIKE_REJECTED: 'Like_Rejected',
	LIKE_CANCELLED: 'Like_Cancelled',

	// 사용자 관리 관련 (Safety/Retention)
	USER_BLOCKED: 'User_Blocked',
	USER_REPORTED: 'User_Reported',

	// 회원가입 관련 (Acquisition → Activation)
	SIGNUP_STARTED: 'Signup_Started',
	SIGNUP_PROFILE_IMAGE_UPLOADED: 'Signup_Profile_Image_Uploaded',
	SIGNUP_INTEREST_SELECTED: 'Signup_Interest_Selected',
	SIGNUP_COMPLETED: 'Signup_done',

	// 매칭 관련 (Activation)
	MATCHING_STARTED: 'Matching_Started',
	MATCHING_PROFILE_VIEWED: 'Matching_Profile_Viewed',
	MATCHING_REQUESTED: 'Matching_Requested',
	MATCHING_SUCCESS: 'Matching_Success',
	MATCHING_FAILED: 'Matching_Failed',
	PROFILE_VIEWED: 'Profile_Viewed',
	FILTER_APPLIED: 'Filter_Applied',

	// 확장 매칭 관련
	EXPAND_REGION_EMPTY_VIEWED: 'Expand_Region_Empty_Viewed',
	EXPAND_REGION_EMPTY_ACTION: 'Expand_Region_Empty_Action',

	// 채팅 관련 (Activation → Retention)
	CHAT_STARTED: 'Chat_Started',
	CHAT_MESSAGE_SENT: 'Chat_Message_Sent',
	CHAT_ENDED: 'Chat_Ended',
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

	// 세션 관련 (Retention)
	SESSION_STARTED: 'Session_Started',
	SESSION_ENDED: 'Session_Ended',
	PUSH_NOTIFICATION_OPENED: 'Push_Notification_Opened',
	FIRST_SESSION_COMPLETED: 'First_Session_Completed',

	// 앱 사용 관련 (Retention)
	APP_OPENED: 'App_Opened',
	APP_BACKGROUNDED: 'App_Backgrounded',
	HOME_VIEWED: 'Home_Viewed',
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

	// 앱 설치 유도 관련 (Web → App Conversion)
	APP_INSTALL_PROMPT_SHOWN: 'App_Install_Prompt_Shown',
	APP_INSTALL_PROMPT_INSTALL_CLICKED: 'App_Install_Prompt_Install_Clicked',
	APP_INSTALL_PROMPT_DISMISSED: 'App_Install_Prompt_Dismissed',

	// ===== HIGH PRIORITY 지표 (2025-12-29 추가) =====

	// 결제 퍼널 심화
	PAYMENT_ABANDONED_CART: 'Payment_Abandoned_Cart',
	PAYMENT_FIRST_PURCHASE: 'Payment_First_Purchase',
	PAYMENT_REPEAT_PURCHASE: 'Payment_Repeat_Purchase',
	GEM_BALANCE_LOW: 'Gem_Balance_Low',
	GEM_BALANCE_DEPLETED: 'Gem_Balance_Depleted',
	GEM_PURCHASE_PROMPT_SHOWN: 'Gem_Purchase_Prompt_Shown',
	GEM_PURCHASE_PROMPT_DISMISSED: 'Gem_Purchase_Prompt_Dismissed',

	// 매칭 효율성
	MATCHING_QUEUE_TIME: 'Matching_Queue_Time',
	MATCHING_QUEUE_JOINED: 'Matching_Queue_Joined',
	MATCHING_QUEUE_ABANDONED: 'Matching_Queue_Abandoned',

	// 좋아요 결과
	LIKE_MATCH_CREATED: 'Like_Match_Created',
	LIKE_LIMIT_REACHED: 'Like_Limit_Reached',

	// 채팅 품질
	CHAT_FIRST_RESPONSE_TIME: 'Chat_First_Response_Time',
	CHAT_AVERAGE_RESPONSE_TIME: 'Chat_Average_Response_Time',
	CHAT_CONVERSATION_LENGTH: 'Chat_Conversation_Length',
	CHAT_CONVERSATION_DURATION: 'Chat_Conversation_Duration',

	// 리텐션 코호트
	DAY_1_RETENTION: 'Day_1_Retention',
	DAY_3_RETENTION: 'Day_3_Retention',
	DAY_7_RETENTION: 'Day_7_Retention',
	DAY_30_RETENTION: 'Day_30_Retention',

	// 첫 경험 (Aha Moment)
	FIRST_MATCH_ACHIEVED: 'First_Match_Achieved',
	FIRST_MESSAGE_SENT: 'First_Message_Sent',
	FIRST_MESSAGE_RECEIVED: 'First_Message_Received',
	FIRST_LIKE_SENT: 'First_Like_Sent',
	FIRST_LIKE_RECEIVED: 'First_Like_Received',

	// ===== 편지 좋아요 이벤트 (2025-01-04 추가) =====

	// 진입/노출
	LETTER_LIKE_ELIGIBLE: 'Letter_Like_Eligible',
	LETTER_LIKE_OPTION_MODAL_SHOWN: 'Letter_Like_Option_Modal_Shown',

	// 선택/행동
	LETTER_LIKE_OPTION_SELECTED: 'Letter_Like_Option_Selected',
	LETTER_PERMISSION_PURCHASED: 'Letter_Permission_Purchased',
	LETTER_GEM_INSUFFICIENT: 'Letter_Gem_Insufficient',

	// 편지 작성
	LETTER_WRITE_STARTED: 'Letter_Write_Started',
	LETTER_PROMPT_SELECTED: 'Letter_Prompt_Selected',
	LETTER_PREVIEW_VIEWED: 'Letter_Preview_Viewed',
	LETTER_WRITE_ABANDONED: 'Letter_Write_Abandoned',

	// 전송 결과
	LETTER_LIKE_SENT: 'Letter_Like_Sent',
	LETTER_LIKE_SUCCESS: 'Letter_Like_Success',
	LETTER_LIKE_FAILED: 'Letter_Like_Failed',

	// ===== 서버 전용 이벤트 (백엔드에서만 발송) =====

	// 매칭 파이프라인 (백엔드 NestJS)
	MATCHING_EXECUTION_COMPLETED: 'Matching_Execution_Completed',
	MATCHING_PIPELINE_STEP: 'Matching_Pipeline_Step',
	VECTOR_SEARCH_EXECUTED: 'Vector_Search_Executed',
	FILTER_RELAXATION_STEP: 'Filter_Relaxation_Step',
	BIDIRECTIONAL_FILTER_EXECUTED: 'Bidirectional_Filter_Executed',
	MATCHING_POOL_SNAPSHOT: 'Matching_Pool_Snapshot',
	MATCHING_FAILURE_ANALYZED: 'Matching_Failure_Analyzed',
} as const;

// 인증 방법 Enum
export const AUTH_METHODS = {
	PASS: 'pass',
	KAKAO: 'kakao',
	APPLE: 'apple',
	JP_SMS: 'jp_sms',
} as const;

// 로그아웃 사유 Enum
export const LOGOUT_REASONS = {
	MANUAL: 'manual',
	SESSION_EXPIRED: 'session_expired',
	ACCOUNT_DELETED: 'account_deleted',
} as const;

// 로그인 이탈 단계 Enum
export const LOGIN_ABANDONED_STEPS = {
	BEFORE_EXTERNAL_APP: 'before_external_app',
	IN_EXTERNAL_APP: 'in_external_app',
	USER_CANCELLED: 'user_cancelled',
	VERIFICATION_TIMEOUT: 'verification_timeout',
	BACK_BUTTON: 'back_button',
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
	SYSTEM: 'system',
	GEM_MANAGEMENT: 'gem_management',
	MONETIZATION: 'monetization',
	REVENUE: 'revenue',
	ACCOUNT_SECURITY: 'account_security',
	SPAM_PREVENTION: 'spam_prevention',
	ACCOUNT_MANAGEMENT: 'account_management',
	SUBSCRIPTION_MANAGEMENT: 'subscription_management',
	SUBSCRIPTION_CANCELLATION: 'subscription_cancellation',
	SUBSCRIPTION_START: 'subscription_start',
	SUBSCRIPTION_RENEWAL: 'subscription_renewal',
	REVENUE_TRACKING: 'revenue_tracking',
	PAYMENT_MANAGEMENT: 'payment_management',
	SUBSCRIPTION_ANALYTICS: 'subscription_analytics',
	SUBSCRIPTION_REVENUE: 'subscription_revenue',
	REACTIVATION: 'reactivation',
	USER_RETENTION: 'user_retention',
	UNIVERSITY_VERIFICATION: 'university_verification',
	PROFILE_SETUP: 'profile_setup',
	COMMUNITY: 'community',
	PAYMENT_FLOW: 'payment_flow',
	PAYMENT_SUCCESS: 'payment_success',
	PAYMENT_FAILURE: 'payment_failure',
	PAYMENT_CANCELLATION: 'payment_cancellation',
	MATCHING: 'matching',
	SETTINGS: 'settings',
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
export type AuthMethod = (typeof AUTH_METHODS)[keyof typeof AUTH_METHODS];
export type LogoutReason = (typeof LOGOUT_REASONS)[keyof typeof LOGOUT_REASONS];
export type LoginAbandonedStep = (typeof LOGIN_ABANDONED_STEPS)[keyof typeof LOGIN_ABANDONED_STEPS];
export type LikeType = (typeof LIKE_TYPES)[keyof typeof LIKE_TYPES];
export type UserActionSource = (typeof USER_ACTION_SOURCES)[keyof typeof USER_ACTION_SOURCES];
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type MatchingType = (typeof MATCHING_TYPES)[keyof typeof MATCHING_TYPES];
export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];
export type EventSource = (typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES];
export type SomemateCategory = (typeof SOMEMATE_CATEGORIES)[keyof typeof SOMEMATE_CATEGORIES];
export type SomemateSessionStatus =
	(typeof SOMEMATE_SESSION_STATUS)[keyof typeof SOMEMATE_SESSION_STATUS];

// 이벤트 속성 타입 정의
export interface BaseEventProperties {
	env?: string;
	timestamp?: number;
	session_id?: string;
	source?: EventSource;
	country?: 'KR' | 'JP'; // 국가별 지표 분리용
	[key: string]: unknown;
}

// 인증 이벤트 속성
export interface AuthEventProperties extends BaseEventProperties {
	auth_method?: AuthMethod;
	login_duration?: number;
	error_type?: string;
	is_new_user?: boolean;
}

// 로그아웃 이벤트 속성
export interface LogoutEventProperties extends BaseEventProperties {
	reason: LogoutReason;
}

// 로그인 이탈 이벤트 속성
export interface AuthLoginAbandonedEventProperties extends BaseEventProperties {
	auth_method: AuthMethod;
	abandoned_step: LoginAbandonedStep;
	time_spent_seconds?: number;
	is_retry?: boolean;
	retry_count?: number;
}

// 외부 앱 이동/복귀 이벤트 속성
export interface AuthExternalAppEventProperties extends BaseEventProperties {
	auth_method: AuthMethod;
	timestamp?: number;
	time_away_seconds?: number;
	returned_with_result?: boolean;
	last_step?: string;
}

// 본인인증 완료 이벤트 속성
export interface IdentityVerificationCompletedEventProperties extends BaseEventProperties {
	auth_method: AuthMethod;
	duration_seconds?: number;
	carrier?: string;
	platform?: 'ios' | 'android' | 'web';
}

// 인증 방법 선택/변경 이벤트 속성
export interface AuthMethodEventProperties extends BaseEventProperties {
	auth_method: AuthMethod;
	is_retry?: boolean;
	retry_count?: number;
	from_method?: AuthMethod;
	to_method?: AuthMethod;
	switch_reason?: 'failure' | 'user_choice';
	previous_failure_reason?: string;
}

// 나이 제한 차단 이벤트 속성
export interface AgeRestrictionBlockedEventProperties extends BaseEventProperties {
	birth_year?: number;
	calculated_age?: number;
	auth_method?: AuthMethod;
}

// 블랙리스트 차단 이벤트 속성
export interface BlacklistBlockedEventProperties extends BaseEventProperties {
	auth_method?: AuthMethod;
	block_reason?: string;
}

// 인증 에러 상세 이벤트 속성
export interface AuthVerificationErrorEventProperties extends BaseEventProperties {
	auth_method: AuthMethod;
	error_type: 'network' | 'timeout' | 'app_not_installed' | 'carrier_error' | 'certificate_expired' | 'user_cancelled' | 'unknown';
	error_code?: string;
	error_message?: string;
	platform?: 'ios' | 'android' | 'web';
}

// 회원 탈퇴 이벤트 속성
export interface AccountDeletionEventProperties extends BaseEventProperties {
	deletion_reason?:
		| 'dissatisfaction'
		| 'goal_achieved'
		| 'price'
		| 'privacy'
		| 'inactivity'
		| 'found_match'
		| 'other';
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

// 확장 매칭 Empty State 이벤트 속성
export interface ExpandRegionEmptyEventProperties extends BaseEventProperties {
	action?: 'wait' | 'dismiss';
	time_on_screen?: number;
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

// 결제 심화 이벤트 속성
export interface PaymentDetailedEventProperties extends PaymentEventProperties {
	price_tier?: 'low' | 'medium' | 'high' | 'premium';
	discount_percentage?: number;
	discount_code?: string;
	abandoned_step?: 'item_selection' | 'payment_method' | 'confirmation' | 'processing';
	abandoned_reason?: 'price_too_high' | 'changed_mind' | 'technical_error' | 'other';
	time_to_purchase?: number;
	is_first_purchase?: boolean;
	days_since_signup?: number;
	gem_balance_before?: number;
	gem_balance_after?: number;
	purchase_trigger?: 'low_balance' | 'feature_locked' | 'promotion' | 'organic';
	cart_value?: number;
	currency?: string;
	payment_provider?: 'portone' | 'apple_iap' | 'google_play';
	subscription_tier?: 'basic' | 'premium' | 'vip';
}

// 매칭 대기열 이벤트 속성
export interface MatchingQueueEventProperties extends MatchingEventProperties {
	queue_wait_time_seconds?: number;
	queue_abandoned?: boolean;
	queue_position?: number;
	estimated_wait_time?: number;
}

// 좋아요 심화 이벤트 속성
export interface LikeDetailedEventProperties extends LikeEventProperties {
	is_mutual?: boolean;
	match_created?: boolean;
	time_to_response?: number;
	likes_remaining?: number;
	is_premium_like?: boolean;
	message_included?: boolean;
	message_length?: number;
	profile_match_score?: number;
	consecutive_likes_count?: number;
}

// 채팅 품질 이벤트 속성
export interface ChatQualityEventProperties extends ChatEventProperties {
	response_time_seconds?: number;
	conversation_turn_count?: number;
	message_character_count?: number;
	is_first_interaction?: boolean;
	time_since_match?: number;
	media_count?: number;
	emoji_count?: number;
	read_time?: number;
	conversation_sentiment?: 'positive' | 'neutral' | 'negative';
}

// 리텐션 이벤트 속성
export interface RetentionEventProperties extends BaseEventProperties {
	days_since_signup?: number;
	first_match_achieved?: boolean;
	first_message_sent?: boolean;
	profile_completion_rate?: number;
	messages_sent?: number;
	matches_count?: number;
	has_purchased?: boolean;
}

// 첫 경험 이벤트 속성
export interface FirstExperienceEventProperties extends BaseEventProperties {
	time_to_first_action?: number;
	signup_date?: string;
	profile_completion_rate?: number;
}

export interface LetterLikeEventProperties extends BaseEventProperties {
	connection_id?: string;
	match_id?: string;
	entry_source?: 'home' | 'profile';
	can_letter?: boolean;

	gem_balance?: number;
	gem_cost?: number;
	letter_cost?: number;
	simple_like_cost?: number;
	gem_balance_before?: number;
	gem_balance_after?: number;
	gem_required?: number;
	gem_shortage?: number;
	had_sufficient_gems?: boolean;

	letter_length?: number;
	is_from_prompt?: boolean;
	prompt_index?: number;
	prompt_text_preview?: string;
	is_valid?: boolean;

	time_spent_seconds?: number;
	time_to_send_seconds?: number;

	option?: 'simple_like' | 'letter_like' | 'charge' | 'dismiss';
	entry_method?: 'direct' | 'after_purchase';
	abandon_reason?: 'back_button' | 'app_background';
	error_type?: string;
	error_message?: string;
	has_mutual_like?: boolean;
}

// ===== 서버 전용 이벤트 속성 (백엔드 NestJS) =====

// 매칭 실행 완료 이벤트 속성
export interface MatchingExecutionCompletedEventProperties extends BaseEventProperties {
	country?: 'KR' | 'JP';
	user_id?: string;
	matched_user_id?: string;
	matching_history_id?: string;
	matching_type?: 'SCHEDULED' | 'ROULETTE' | 'REMATCH';
	similarity_score?: number;
	matching_duration_ms?: number;
	total_process_steps?: number;
	initial_candidates?: number;
	final_candidates?: number;
	total_elimination_count?: number;
	elimination_rate?: number;
	is_success?: boolean;
	has_ai_description?: boolean;
}

// 매칭 파이프라인 단계 이벤트 속성
export interface MatchingPipelineStepEventProperties extends BaseEventProperties {
	country?: 'KR' | 'JP';
	user_id?: string;
	matching_history_id?: string;
	step?: string;
	step_name?: string;
	step_order?: number;
	candidates_before?: number;
	candidates_after?: number;
	candidates_filtered?: number;
	filter_rate?: number;
	duration_ms?: number;
	filtered_reasons?: {
		avoid_university?: number;
		avoid_department?: number;
		contact_block?: number;
		gender_mismatch?: number;
		already_matched?: number;
	};
}

// 벡터 검색 실행 이벤트 속성
export interface VectorSearchExecutedEventProperties extends BaseEventProperties {
	country?: 'KR' | 'JP';
	user_id?: string;
	collection?: 'profiles_partner';
	search_limit?: number;
	score_threshold?: number;
	qdrant_filters?: {
		country?: 'KR' | 'JP';
		gender?: 'male' | 'female';
		regions?: string[];
		age_min?: number;
		age_max?: number;
		must_not_user_ids_count?: number;
	};
	results_count?: number;
	is_sufficient?: boolean;
	search_time_ms?: number;
	similarity_stats?: {
		min?: number;
		max?: number;
		avg?: number;
		median?: number;
	};
	has_mbti_bonus?: boolean;
	user_mbti?: string;
}

// 필터 완화 단계 이벤트 속성
export interface FilterRelaxationStepEventProperties extends BaseEventProperties {
	country?: 'KR' | 'JP';
	user_id?: string;
	relaxation_mode?: 'static' | 'dynamic';
	step_index?: number;
	step_description?: string;
	region_level?: 'NEARBY' | 'METROPOLITAN' | 'NATIONWIDE';
	region_level_name?: string;
	user_region?: string;
	search_regions?: string[];
	applied_filters?: string[];
	relaxed_filters?: string[];
	candidates_found?: number;
	is_success?: boolean;
	will_retry?: boolean;
	adjusted_limit?: number;
	allow_external_cluster?: boolean;
}

// 양방향 필터 실행 이벤트 속성
export interface BidirectionalFilterExecutedEventProperties extends BaseEventProperties {
	country?: 'KR' | 'JP';
	user_id?: string;
	filters_enabled?: {
		avoid_university?: boolean;
		avoid_department?: boolean;
		contact_block?: boolean;
	};
	candidates_before?: number;
	candidates_after?: number;
	eliminated_by?: {
		avoid_university?: number;
		avoid_department?: number;
		contact_block?: number;
	};
	user_university_id?: string;
	user_department_id?: string;
	user_phone_hash?: string;
	user_contact_hashes_count?: number;
	filter_duration_ms?: number;
	is_over_filtering?: boolean;
	total_elimination_rate?: number;
}

// 매칭 풀 스냅샷 이벤트 속성
export interface MatchingPoolSnapshotEventProperties extends BaseEventProperties {
	country?: 'KR' | 'JP';
	snapshot_time?: string;
	snapshot_trigger?: 'scheduled' | 'on_demand';
	total_users_in_qdrant?: number;
	approved_users_count?: number;
	deleted_users_count?: number;
	male_users?: number;
	female_users?: number;
	gender_ratio?: number;
	users_by_region?: Record<string, number>;
	users_by_metropolitan?: Record<string, number>;
	users_by_age?: {
		'18-20'?: number;
		'21-23'?: number;
		'24-26'?: number;
		'27+'?: number;
	};
	active_users_last_7_days?: number;
	dormant_users?: number;
	avoid_university_enabled_count?: number;
	avoid_department_enabled_count?: number;
	contact_block_enabled_count?: number;
	pool_health_score?: number;
}

// 매칭 실패 분석 이벤트 속성
export interface MatchingFailureAnalyzedEventProperties extends BaseEventProperties {
	country?: 'KR' | 'JP';
	user_id?: string;
	matching_type?: 'SCHEDULED' | 'ROULETTE' | 'REMATCH';
	failure_stage?:
		| 'CONTEXT_CREATION_FAILED'
		| 'VECTOR_SEARCH_EMPTY'
		| 'ALL_FILTERED_OUT'
		| 'PIPELINE_ERROR';
	user_profile?: {
		age?: number;
		gender?: 'male' | 'female';
		region?: string;
		university_id?: string;
		department_id?: string;
	};
	filters_enabled?: {
		avoid_university?: boolean;
		avoid_department?: boolean;
		contact_block?: boolean;
	};
	vector_search_attempts?: number;
	max_relaxation_level_reached?: 'NEARBY' | 'METROPOLITAN' | 'NATIONWIDE' | null;
	total_candidates_from_vector?: number;
	candidates_after_filter?: number;
	pool_state?: {
		total_opposite_gender_in_region?: number;
		total_opposite_gender_in_metropolitan?: number;
		total_opposite_gender_nationwide?: number;
	};
	suggested_actions?: string[];
	can_retry?: boolean;
	retry_available_at?: string;
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
	First_Message_Sent_After_Match: ChatEventProperties;
	Match_Conversation_Rate: MatchingEventProperties;
	Match_Card_Viewed: MatchingEventProperties;
	Match_Time_To_Response: MatchingEventProperties;

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
	Auth_Login_Abandoned: AuthLoginAbandonedEventProperties;
	Auth_Logout: LogoutEventProperties;

	// 회원 관리 관련
	Account_Deletion_Requested: AccountDeletionEventProperties;
	Account_Deletion_Cancelled: AccountDeletionEventProperties;
	Account_Deleted: AccountDeletionEventProperties;
	Account_Reactivated: BaseEventProperties;

	// 좋아요 관련
	Like_Sent: LikeEventProperties;
	Like_Received: LikeEventProperties;
	Like_List_Viewed: LikeEventProperties;
	Like_Rejected: LikeEventProperties;
	Like_Cancelled: LikeEventProperties;

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

	// 확장 매칭 관련
	Expand_Region_Empty_Viewed: ExpandRegionEmptyEventProperties;
	Expand_Region_Empty_Action: ExpandRegionEmptyEventProperties;

	// 채팅 관련
	Chat_Started: ChatEventProperties;
	Chat_Message_Sent: ChatEventProperties;
	Chat_Ended: ChatEventProperties;
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
	Home_Viewed: BaseEventProperties;
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

	// High Priority 지표 (2025-12-29 추가)
	Payment_Abandoned_Cart: PaymentDetailedEventProperties;
	Payment_Abandoned_At_Step: PaymentDetailedEventProperties;
	Payment_First_Purchase: PaymentDetailedEventProperties;
	Payment_Repeat_Purchase: PaymentDetailedEventProperties;
	Gem_Balance_Low: PaymentDetailedEventProperties;
	Gem_Balance_Depleted: PaymentDetailedEventProperties;
	Gem_Purchase_Prompt_Shown: PaymentDetailedEventProperties;
	Gem_Purchase_Prompt_Dismissed: PaymentDetailedEventProperties;

	Matching_Queue_Time: MatchingQueueEventProperties;
	Matching_Queue_Joined: MatchingQueueEventProperties;
	Matching_Queue_Abandoned: MatchingQueueEventProperties;

	Like_Match_Created: LikeDetailedEventProperties;
	Like_Limit_Reached: LikeDetailedEventProperties;

	Chat_First_Response_Time: ChatQualityEventProperties;
	Chat_Average_Response_Time: ChatQualityEventProperties;
	Chat_Conversation_Length: ChatQualityEventProperties;
	Chat_Conversation_Duration: ChatQualityEventProperties;

	Day_1_Retention: RetentionEventProperties;
	Day_3_Retention: RetentionEventProperties;
	Day_7_Retention: RetentionEventProperties;
	Day_30_Retention: RetentionEventProperties;

	First_Match_Achieved: FirstExperienceEventProperties;
	First_Message_Sent: FirstExperienceEventProperties;
	First_Message_Received: FirstExperienceEventProperties;
	First_Like_Sent: FirstExperienceEventProperties;
	First_Like_Received: FirstExperienceEventProperties;

	// 서버 전용 이벤트 (백엔드 NestJS)
	Matching_Execution_Completed: MatchingExecutionCompletedEventProperties;
	Matching_Pipeline_Step: MatchingPipelineStepEventProperties;
	Vector_Search_Executed: VectorSearchExecutedEventProperties;
	Filter_Relaxation_Step: FilterRelaxationStepEventProperties;
	Bidirectional_Filter_Executed: BidirectionalFilterExecutedEventProperties;
	Matching_Pool_Snapshot: MatchingPoolSnapshotEventProperties;
	Matching_Failure_Analyzed: MatchingFailureAnalyzedEventProperties;

	Letter_Like_Eligible: LetterLikeEventProperties;
	Letter_Like_Option_Modal_Shown: LetterLikeEventProperties;
	Letter_Like_Option_Selected: LetterLikeEventProperties;
	Letter_Permission_Purchased: LetterLikeEventProperties;
	Letter_Gem_Insufficient: LetterLikeEventProperties;
	Letter_Write_Started: LetterLikeEventProperties;
	Letter_Prompt_Selected: LetterLikeEventProperties;
	Letter_Preview_Viewed: LetterLikeEventProperties;
	Letter_Write_Abandoned: LetterLikeEventProperties;
	Letter_Like_Sent: LetterLikeEventProperties;
	Letter_Like_Success: LetterLikeEventProperties;
	Letter_Like_Failed: LetterLikeEventProperties;

	[key: string]: BaseEventProperties;
}

// Backward compatibility - 기존 코드에서 AMPLITUDE_KPI_EVENTS, AMPLITUDE_EVENTS를 사용하는 경우 대응
export const AMPLITUDE_KPI_EVENTS = MIXPANEL_EVENTS;
export const AMPLITUDE_EVENTS = MIXPANEL_EVENTS;
