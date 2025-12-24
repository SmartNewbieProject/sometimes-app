/**
 * 카드뉴스 Mixpanel 이벤트 상수
 * AARRR 프레임워크 기반 - Retention/Engagement 카테고리
 */

export const CARD_NEWS_EVENTS = {
  // 노출/진입 이벤트
  SECTION_VIEWED: 'CardNews_Section_Viewed',
  DETAIL_ENTERED: 'CardNews_Detail_Entered',

  // 인터랙션 이벤트
  HIGHLIGHT_CLICKED: 'CardNews_Highlight_Clicked',
  HIGHLIGHT_SWIPED: 'CardNews_Highlight_Swiped',
  LIST_ITEM_CLICKED: 'CardNews_List_Item_Clicked',
  CARD_NAVIGATED: 'CardNews_Card_Navigated',
  FAQ_CLICKED: 'CardNews_FAQ_Clicked',

  // 완료/성과 이벤트
  COMPLETED: 'CardNews_Completed',
  EXITED: 'CardNews_Exited',
  REWARD_CLAIMED: 'CardNews_Reward_Claimed',

  // 목록 이벤트
  LIST_END_REACHED: 'CardNews_List_End_Reached',
} as const;

export type CardNewsEventName = typeof CARD_NEWS_EVENTS[keyof typeof CARD_NEWS_EVENTS];

// 진입 소스 타입
export const CARD_NEWS_ENTRY_SOURCES = {
  HIGHLIGHT: 'highlight',
  LIST: 'list',
  PUSH: 'push',
  DEEP_LINK: 'deep_link',
  HOME: 'home',
} as const;

export type CardNewsEntrySource = typeof CARD_NEWS_ENTRY_SOURCES[keyof typeof CARD_NEWS_ENTRY_SOURCES];

// 네비게이션 방식 타입
export const CARD_NEWS_NAVIGATION_METHODS = {
  TAP_LEFT: 'tap_left',
  TAP_RIGHT: 'tap_right',
  SWIPE: 'swipe',
} as const;

export type CardNewsNavigationMethod = typeof CARD_NEWS_NAVIGATION_METHODS[keyof typeof CARD_NEWS_NAVIGATION_METHODS];

// 이탈 방식 타입
export const CARD_NEWS_EXIT_METHODS = {
  BACK_BUTTON: 'back_button',
  SWIPE_BACK: 'swipe_back',
  APP_BACKGROUND: 'app_background',
} as const;

export type CardNewsExitMethod = typeof CARD_NEWS_EXIT_METHODS[keyof typeof CARD_NEWS_EXIT_METHODS];

// 이벤트 속성 타입 정의
export interface CardNewsSectionViewedProperties {
  highlight_count: number;
  has_list_items: boolean;
  source: 'home' | 'deep_link';
}

export interface CardNewsDetailEnteredProperties {
  card_news_id: string;
  card_news_title: string;
  total_sections: number;
  entry_source: CardNewsEntrySource;
  position_in_list?: number;
}

export interface CardNewsHighlightClickedProperties {
  card_news_id: string;
  card_news_title: string;
  position: number;
  was_auto_scrolled: boolean;
}

export interface CardNewsHighlightSwipedProperties {
  from_position: number;
  to_position: number;
  direction: 'left' | 'right';
  swipe_duration_ms: number;
}

export interface CardNewsListItemClickedProperties {
  card_news_id: string;
  card_news_title: string;
  position_in_list: number;
  published_at: string;
  read_count: number;
}

export interface CardNewsCardNavigatedProperties {
  card_news_id: string;
  from_section: number;
  to_section: number;
  navigation_method: CardNewsNavigationMethod;
  time_on_previous_card_ms: number;
}

export interface CardNewsCompletedProperties {
  card_news_id: string;
  card_news_title: string;
  total_sections: number;
  total_reading_time_ms: number;
  avg_time_per_card_ms: number;
  entry_source: CardNewsEntrySource;
}

export interface CardNewsExitedProperties {
  card_news_id: string;
  card_news_title: string;
  exit_section: number;
  total_sections: number;
  completion_rate: number;
  total_reading_time_ms: number;
  exit_method: CardNewsExitMethod;
}

export interface CardNewsRewardClaimedProperties {
  card_news_id: string;
  reward_type: 'gem' | 'point';
  reward_amount: number;
  reading_time_ms: number;
}

export interface CardNewsListEndReachedProperties {
  total_items_viewed: number;
  has_more: boolean;
}

export interface CardNewsFAQClickedProperties {
  source: 'card_news_home';
}
