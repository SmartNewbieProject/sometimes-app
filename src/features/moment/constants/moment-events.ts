/**
 * Moment 기능 Mixpanel 이벤트 상수 정의
 * 모든 Moment 관련 분석 이벤트를 중앙 집중화
 */

export const MOMENT_EVENTS = {
  // ========== 페이지 진입 ==========
  PAGE_MOMENT_HOME_VIEW: 'Moment_Home_View',
  PAGE_MY_MOMENT_VIEW: 'Moment_My_Moment_View',
  PAGE_QUESTION_DETAIL_VIEW: 'Moment_Question_Detail_View',
  PAGE_WEEKLY_REPORT_VIEW: 'Moment_Weekly_Report_View',
  PAGE_MY_ANSWERS_VIEW: 'Moment_My_Answers_View',
  PAGE_MY_MOMENT_RECORD_VIEW: 'Moment_My_Moment_Record_View',

  // ========== 배너/슬라이드 ==========
  BANNER_SLIDE_VIEW: 'Moment_Banner_Slide_View',
  BANNER_SLIDE_CLICK: 'Moment_Banner_Slide_Click',
  BANNER_SLIDE_SWIPE: 'Moment_Banner_Slide_Swipe',

  // ========== 네비게이션 메뉴 ==========
  NAV_MY_MOMENT_CLICK: 'Moment_Nav_My_Moment_Click',
  NAV_DAILY_ROULETTE_CLICK: 'Moment_Nav_Daily_Roulette_Click',
  NAV_SOMEMATE_CLICK: 'Moment_Nav_Somemate_Click',
  NAV_WEEKLY_REPORT_CLICK: 'Moment_Nav_Weekly_Report_Click',
  NAV_EVENTS_CLICK: 'Moment_Nav_Events_Click',
  NAV_CHECKIN_CLICK: 'Moment_Nav_Checkin_Click',

  // ========== 질문 카드 ==========
  QUESTION_CARD_VIEW: 'Moment_Question_Card_View',
  QUESTION_CARD_CLICK: 'Moment_Question_Card_Click',
  QUESTION_CARD_BLOCKED: 'Moment_Question_Card_Blocked',

  // ========== 질문 상세 (퍼널) ==========
  QUESTION_ENVELOPE_VIEW: 'Moment_Question_Envelope_View',
  QUESTION_ENVELOPE_OPEN: 'Moment_Question_Envelope_Open',
  QUESTION_READING_START: 'Moment_Question_Reading_Start',
  QUESTION_TYPE_TOGGLE: 'Moment_Question_Type_Toggle',
  QUESTION_AI_INSPIRATION_CLICK: 'Moment_Question_AI_Inspiration_Click',
  QUESTION_AI_INSPIRATION_APPLY: 'Moment_Question_AI_Inspiration_Apply',
  QUESTION_TEXT_INPUT_START: 'Moment_Question_Text_Input_Start',
  QUESTION_OPTION_SELECT: 'Moment_Question_Option_Select',
  QUESTION_SUBMIT_ATTEMPT: 'Moment_Question_Submit_Attempt',
  QUESTION_SUBMIT_SUCCESS: 'Moment_Question_Submit_Success',
  QUESTION_SUBMIT_FAIL: 'Moment_Question_Submit_Fail',
  QUESTION_REWARD_VIEW: 'Moment_Question_Reward_View',
  QUESTION_COMPLETE_BACK: 'Moment_Question_Complete_Back',

  // ========== 위클리 리포트 ==========
  REPORT_CHART_VIEW: 'Moment_Report_Chart_View',
  REPORT_INSIGHT_EXPAND: 'Moment_Report_Insight_Expand',
  REPORT_INSIGHT_COLLAPSE: 'Moment_Report_Insight_Collapse',
  REPORT_KEYWORD_VIEW: 'Moment_Report_Keyword_View',
  REPORT_PROFILE_SYNC_CLICK: 'Moment_Report_Profile_Sync_Click',
  REPORT_PROFILE_SYNC_SUCCESS: 'Moment_Report_Profile_Sync_Success',
  REPORT_PROFILE_SYNC_FAIL: 'Moment_Report_Profile_Sync_Fail',

  // ========== 히스토리 ==========
  HISTORY_REPORT_CLICK: 'Moment_History_Report_Click',
  HISTORY_ANSWER_CLICK: 'Moment_History_Answer_Click',
  HISTORY_SCROLL_LOAD_MORE: 'Moment_History_Scroll_Load_More',

  // ========== 가이드 섹션 ==========
  GUIDE_REWARD_VIEW: 'Moment_Guide_Reward_View',
} as const;

export type MomentEventName = typeof MOMENT_EVENTS[keyof typeof MOMENT_EVENTS];

// ========== 이벤트 Properties 타입 정의 ==========

export interface MomentPageViewProperties {
  source?: string;
  has_daily_question?: boolean;
  is_responded?: boolean;
  is_blocked?: boolean;
}

export interface MomentBannerProperties {
  slide_id: string;
  slide_index?: number;
  slide_title?: string;
  external_url?: string;
  direction?: 'left' | 'right';
  from_index?: number;
  to_index?: number;
}

export interface MomentNavProperties {
  is_ready?: boolean;
  is_eligible?: boolean;
  destination?: string;
}

export interface MomentQuestionCardProperties {
  card_state: 'unresponded' | 'responded' | 'blocked';
  blocked_reason?: 'no_question' | 'already_answered' | 'previous_not_answered' | string;
  destination?: string;
}

export interface MomentQuestionDetailProperties {
  question_id: string;
  question_text?: string;
  question_type?: 'text' | 'single_choice';
  dimension?: string;
  has_options?: boolean;
  question_date?: string;
}

export interface MomentQuestionTypeToggleProperties {
  question_id: string;
  from_type: 'text' | 'multiple-choice';
  to_type: 'text' | 'multiple-choice';
}

export interface MomentQuestionAnswerProperties {
  question_id: string;
  answer_type?: 'text' | 'option' | 'mixed';
  text_length?: number;
  option_id?: string;
  option_index?: number;
  response_time_seconds?: number;
  total_time_seconds?: number;
}

export interface MomentQuestionSubmitProperties extends MomentQuestionAnswerProperties {
  error_message?: string;
  error_code?: string;
}

export interface MomentReportProperties {
  week: number;
  year: number;
  is_current_week?: boolean;
  average_score?: number;
  has_previous_week?: boolean;
  report_title?: string;
}

export interface MomentReportInsightProperties {
  category: string;
  section_index?: number;
}

export interface MomentReportKeywordProperties {
  keywords: string[];
  keyword_count: number;
}

export interface MomentReportSyncProperties {
  keywords_count?: number;
  synced_keywords?: string[];
  error_message?: string;
}

export interface MomentHistoryProperties {
  week?: number;
  year?: number;
  report_title?: string;
  question_id?: string;
  answer_date?: string;
  page?: number;
  items_loaded?: number;
  total_loaded?: number;
}

export interface MomentAIInspirationProperties {
  question_id: string;
  suggestion_length?: number;
}
