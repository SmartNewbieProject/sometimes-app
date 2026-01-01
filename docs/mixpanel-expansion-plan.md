# Mixpanel 지표 확장 계획

## 개요
Sometimes 앱의 핵심 도메인별로 추가할 운영 지표 제안서입니다.
AARRR 프레임워크(Acquisition, Activation, Retention, Revenue, Referral)를 기반으로 구성되었습니다.

---

## 1. 💬 채팅 (Chat) - 참여도 & 품질 측정

### 현재 있는 지표
- `Chat_Started`, `Chat_Message_Sent`, `Chat_Ended`
- `Chat_Gift_Sent`, `Chat_Response`, `Chat_24h_Active`

### 추가 추천 지표

#### 📈 대화 품질 측정
```typescript
// 채팅 참여도 심화 지표
CHAT_IMAGE_SENT: 'Chat_Image_Sent',
CHAT_VOICE_MESSAGE_SENT: 'Chat_Voice_Message_Sent',
CHAT_EMOJI_USED: 'Chat_Emoji_Used',
CHAT_LINK_SHARED: 'Chat_Link_Shared',
CHAT_STICKER_SENT: 'Chat_Sticker_Sent',

// 대화 흐름 분석
CHAT_FIRST_RESPONSE_TIME: 'Chat_First_Response_Time',          // 첫 응답까지 시간
CHAT_AVERAGE_RESPONSE_TIME: 'Chat_Average_Response_Time',      // 평균 응답 시간
CHAT_CONVERSATION_LENGTH: 'Chat_Conversation_Length',          // 메시지 개수
CHAT_CONVERSATION_DURATION: 'Chat_Conversation_Duration',      // 대화 지속 시간
CHAT_TYPING_INDICATOR_SHOWN: 'Chat_Typing_Indicator_Shown',    // 타이핑 중 표시

// 채팅 내 액션
CHAT_PROFILE_VIEWED_FROM_CHAT: 'Chat_Profile_Viewed_From_Chat',
CHAT_PHOTO_VIEWED: 'Chat_Photo_Viewed',                        // 상대방 사진 조회
CHAT_MESSAGE_DELETED: 'Chat_Message_Deleted',
CHAT_MESSAGE_EDITED: 'Chat_Message_Edited',
CHAT_READ_RECEIPT_VIEWED: 'Chat_Read_Receipt_Viewed',          // 읽음 확인

// 안전성 지표
CHAT_BLOCKED_FROM_CHAT: 'Chat_Blocked_From_Chat',
CHAT_REPORTED_FROM_CHAT: 'Chat_Reported_From_Chat',
CHAT_INAPPROPRIATE_CONTENT_DETECTED: 'Chat_Inappropriate_Content_Detected',

// 참여 유도
CHAT_NOTIFICATION_CLICKED: 'Chat_Notification_Clicked',
CHAT_REMINDER_SHOWN: 'Chat_Reminder_Shown',                    // "답장하지 않은 대화" 리마인더
CHAT_ICE_BREAKER_USED: 'Chat_Ice_Breaker_Used',                // 대화 시작 템플릿 사용
```

#### 속성 정의
```typescript
export interface ChatDetailedEventProperties extends ChatEventProperties {
  response_time_seconds?: number;           // 응답 시간
  conversation_turn_count?: number;         // 대화 턴 수 (주고받은 횟수)
  message_character_count?: number;         // 메시지 글자 수
  is_first_interaction?: boolean;           // 첫 상호작용 여부
  time_since_match?: number;                // 매칭 후 경과 시간
  media_count?: number;                     // 미디어 첨부 개수
  emoji_count?: number;                     // 이모지 개수
  read_time?: number;                       // 메시지를 읽은 시간
  conversation_sentiment?: 'positive' | 'neutral' | 'negative'; // 대화 감정 분석 (선택)
}
```

**비즈니스 임팩트:**
- **매칭 품질 개선**: 응답 시간, 대화 길이로 매칭 알고리즘 최적화
- **참여율 향상**: 대화가 끊기는 지점 파악 → 개입 포인트 설정
- **수익화**: 고품질 대화를 하는 사용자 → 프리미엄 기능 유도

---

## 2. 💰 결제 (Payment) - 전환율 & 수익 최적화

### 현재 있는 지표
- `Payment_Initiated`, `Payment_Completed`, `Payment_Failed`, `Payment_Cancelled`
- `Payment_Store_Viewed`, `Payment_Item_Selected`
- `Subscription_Started/Renewed/Cancelled`

### 추가 추천 지표

#### 💳 결제 퍼널 심화
```typescript
// 가격 민감도 분석
PAYMENT_PRICE_POINT_VIEWED: 'Payment_Price_Point_Viewed',      // 각 가격 옵션 조회
PAYMENT_DISCOUNT_APPLIED: 'Payment_Discount_Applied',
PAYMENT_BUNDLE_VIEWED: 'Payment_Bundle_Viewed',                // 번들 상품 조회
PAYMENT_COMPARISON_VIEWED: 'Payment_Comparison_Viewed',        // 가격 비교 화면

// 첫 구매 & 재구매 추적
PAYMENT_FIRST_PURCHASE: 'Payment_First_Purchase',              // ⭐ 중요: 첫 구매
PAYMENT_REPEAT_PURCHASE: 'Payment_Repeat_Purchase',
PAYMENT_DAYS_SINCE_LAST_PURCHASE: 'Payment_Days_Since_Last_Purchase',

// 업셀 & 크로스셀
PAYMENT_UPSELL_SHOWN: 'Payment_Upsell_Shown',                  // "더 많은 젬을 추천드려요"
PAYMENT_UPSELL_ACCEPTED: 'Payment_Upsell_Accepted',
PAYMENT_CROSS_SELL_SHOWN: 'Payment_Cross_Sell_Shown',          // "이 상품도 함께 구매하세요"
PAYMENT_CROSS_SELL_ACCEPTED: 'Payment_Cross_Sell_Accepted',

// 결제 포기 & 재시도
PAYMENT_ABANDONED_CART: 'Payment_Abandoned_Cart',              // ⭐ 중요: 결제 중단
PAYMENT_ABANDONED_AT_STEP: 'Payment_Abandoned_At_Step',        // 어느 단계에서 이탈했는지
PAYMENT_RETRY_AFTER_FAIL: 'Payment_Retry_After_Fail',
PAYMENT_METHOD_CHANGED: 'Payment_Method_Changed',

// 환불 관리
PAYMENT_REFUND_REQUESTED: 'Payment_Refund_Requested',
PAYMENT_REFUND_COMPLETED: 'Payment_Refund_Completed',
PAYMENT_REFUND_REASON: 'Payment_Refund_Reason',

// 잔액 & 프롬프트
GEM_BALANCE_LOW: 'Gem_Balance_Low',                             // 젬 부족 감지
GEM_BALANCE_DEPLETED: 'Gem_Balance_Depleted',                   // 젬 0개
GEM_PURCHASE_PROMPT_SHOWN: 'Gem_Purchase_Prompt_Shown',        // 구매 유도 모달
GEM_PURCHASE_PROMPT_DISMISSED: 'Gem_Purchase_Prompt_Dismissed',
GEM_AUTO_REFILL_ENABLED: 'Gem_Auto_Refill_Enabled',             // 자동 충전 설정

// 무료 체험
FREE_TRIAL_STARTED: 'Free_Trial_Started',
FREE_TRIAL_CONVERTED: 'Free_Trial_Converted',                   // 유료 전환
FREE_TRIAL_EXPIRED: 'Free_Trial_Expired',
FREE_TRIAL_CANCELLED: 'Free_Trial_Cancelled',

// 영수증 & 지원
PAYMENT_RECEIPT_VIEWED: 'Payment_Receipt_Viewed',
PAYMENT_RECEIPT_DOWNLOADED: 'Payment_Receipt_Downloaded',
PAYMENT_SUPPORT_CONTACTED: 'Payment_Support_Contacted',
```

#### 속성 정의
```typescript
export interface PaymentDetailedEventProperties extends PaymentEventProperties {
  price_tier?: 'low' | 'medium' | 'high' | 'premium';
  discount_percentage?: number;
  discount_code?: string;
  abandoned_step?: 'item_selection' | 'payment_method' | 'confirmation' | 'processing';
  abandoned_reason?: 'price_too_high' | 'changed_mind' | 'technical_error' | 'other';
  time_to_purchase?: number;                    // 상점 진입부터 구매까지 시간
  is_first_purchase?: boolean;
  days_since_signup?: number;
  gem_balance_before?: number;
  gem_balance_after?: number;
  purchase_trigger?: 'low_balance' | 'feature_locked' | 'promotion' | 'organic';
  cart_value?: number;                          // 장바구니 총액
  currency?: string;
  payment_provider?: 'portone' | 'apple_iap' | 'google_play';
  subscription_tier?: 'basic' | 'premium' | 'vip';
}
```

**비즈니스 임팩트:**
- **전환율 최적화**: 결제 포기 지점 파악 → A/B 테스트로 개선
- **LTV 증가**: 첫 구매까지 시간, 재구매 주기 분석 → 타겟 마케팅
- **프로모션 효과**: 할인/번들 전환율 측정 → ROI 계산

---

## 3. 💕 매칭 (Matching) - 알고리즘 & 효율성

### 현재 있는 지표
- `Matching_Started`, `Matching_Profile_Viewed`, `Matching_Requested`
- `Match_Request_Sent`, `Match_Accepted`, `Match_Rejected`

### 추가 추천 지표

#### 🎯 매칭 효율성
```typescript
// 매칭 대기열 & 시간
MATCHING_QUEUE_JOINED: 'Matching_Queue_Joined',
MATCHING_QUEUE_TIME: 'Matching_Queue_Time',                    // ⭐ 중요: 대기 시간
MATCHING_QUEUE_ABANDONED: 'Matching_Queue_Abandoned',          // 대기 중 이탈

// 프로필 탐색 행동
MATCHING_PROFILE_SWIPE_LEFT: 'Matching_Profile_Swipe_Left',    // 거부
MATCHING_PROFILE_SWIPE_RIGHT: 'Matching_Profile_Swipe_Right',  // 관심
MATCHING_PROFILE_SKIP: 'Matching_Profile_Skip',
MATCHING_PROFILE_PHOTO_SWIPED: 'Matching_Profile_Photo_Swiped', // 사진 스와이프
MATCHING_PROFILE_BIO_READ: 'Matching_Profile_Bio_Read',         // 바이오 읽음
MATCHING_PROFILE_INFO_EXPANDED: 'Matching_Profile_Info_Expanded', // 상세 정보 열람

// 매칭 선호도 & 설정
MATCHING_PREFERENCES_UPDATED: 'Matching_Preferences_Updated',
MATCHING_FILTER_APPLIED: 'Matching_Filter_Applied',
MATCHING_DISCOVERY_SETTINGS_CHANGED: 'Matching_Discovery_Settings_Changed',
MATCHING_AGE_RANGE_CHANGED: 'Matching_Age_Range_Changed',
MATCHING_DISTANCE_CHANGED: 'Matching_Distance_Changed',

// 프리미엄 매칭 기능
MATCHING_SUPER_LIKE_USED: 'Matching_Super_Like_Used',
MATCHING_BOOST_ACTIVATED: 'Matching_Boost_Activated',          // 프로필 부스트
MATCHING_REWIND_USED: 'Matching_Rewind_Used',                  // 실수 취소

// 매칭 성공 후
MATCH_CREATED: 'Match_Created',                                 // 상호 매칭 성공
MATCH_EXPIRED: 'Match_Expired',                                 // 24시간 내 대화 없음
MATCH_UNMATCHED: 'Match_Unmatched',                             // 매칭 해제
MATCH_REMINDER_SENT: 'Match_Reminder_Sent',                     // "새 매칭!" 알림
MATCH_REMINDER_CLICKED: 'Match_Reminder_Clicked',

// 매칭 품질 피드백
MATCH_QUALITY_FEEDBACK_SHOWN: 'Match_Quality_Feedback_Shown',  // "이 매칭 어떠셨나요?"
MATCH_QUALITY_FEEDBACK_SUBMITTED: 'Match_Quality_Feedback_Submitted',
```

#### 속성 정의
```typescript
export interface MatchingDetailedEventProperties extends MatchingEventProperties {
  queue_wait_time_seconds?: number;
  profiles_viewed_before_match?: number;        // 매칭 전 본 프로필 수
  swipe_direction?: 'left' | 'right' | 'up';    // 스와이프 방향
  profile_photo_index?: number;                 // 몇 번째 사진을 봤는지
  profile_completion_rate?: number;             // 상대 프로필 완성도
  mutual_interests_count?: number;              // 공통 관심사 개수
  distance_km?: number;                         // 거리
  university_match?: boolean;                   // 같은 대학 여부
  major_match?: boolean;                        // 같은 전공 여부
  match_score?: number;                         // 매칭 알고리즘 점수 (0-100)
  match_quality_rating?: 1 | 2 | 3 | 4 | 5;    // 사용자가 준 평점
  boost_active?: boolean;                       // 부스트 사용 중 여부
}
```

**비즈니스 임팩트:**
- **알고리즘 개선**: 매칭 점수 vs 실제 대화율 상관관계 분석
- **대기 시간 최적화**: 긴 대기 시간 → 이탈 방지 메커니즘
- **수익화**: 부스트, 슈퍼 라이크 등 프리미엄 기능 전환율

---

## 4. ❤️ 좋아요 (Like) - 참여 유도

### 현재 있는 지표
- `Like_Sent`, `Like_Received`, `Like_List_Viewed`, `Like_Rejected`, `Like_Cancelled`

### 추가 추천 지표

```typescript
// 좋아요 결과
LIKE_MATCH_CREATED: 'Like_Match_Created',                       // ⭐ 중요: 좋아요로 매칭 성사
LIKE_MUTUAL_MATCH: 'Like_Mutual_Match',                         // 상호 좋아요
LIKE_ONE_SIDED: 'Like_One_Sided',                               // 일방적 좋아요

// 좋아요 기능 사용
LIKE_UNDO_USED: 'Like_Undo_Used',                               // 좋아요 취소 (프리미엄)
LIKE_LIMIT_REACHED: 'Like_Limit_Reached',                       // 무료 좋아요 한도 도달
LIKE_LIMIT_RESET: 'Like_Limit_Reset',                           // 한도 리셋 (24시간 후)
LIKE_PREMIUM_USED: 'Like_Premium_Used',                         // 프리미엄 좋아요 사용
LIKE_WITH_MESSAGE_SENT: 'Like_With_Message_Sent',              // 메시지 포함 좋아요

// 좋아요 알림
LIKE_NOTIFICATION_RECEIVED: 'Like_Notification_Received',
LIKE_NOTIFICATION_CLICKED: 'Like_Notification_Clicked',
LIKE_BOOST_NOTIFICATION: 'Like_Boost_Notification',            // "오늘 좋아요 5개 받았어요!"

// 프로필 품질 경고
LIKE_PROFILE_INCOMPLETE_WARNING: 'Like_Profile_Incomplete_Warning', // "프로필을 완성하면 매칭률이 올라가요"
LIKE_PHOTO_QUALITY_WARNING: 'Like_Photo_Quality_Warning',

// 좋아요 패턴 분석
LIKE_SPREE_DETECTED: 'Like_Spree_Detected',                     // 짧은 시간 내 다량 좋아요
LIKE_SELECTIVE_BEHAVIOR: 'Like_Selective_Behavior',            // 신중한 좋아요 패턴
```

#### 속성 정의
```typescript
export interface LikeDetailedEventProperties extends LikeEventProperties {
  is_mutual?: boolean;
  match_created?: boolean;
  time_to_response?: number;                    // 좋아요 후 응답까지 시간
  likes_remaining?: number;                     // 남은 좋아요 개수
  is_premium_like?: boolean;
  message_included?: boolean;
  message_length?: number;
  profile_match_score?: number;
  consecutive_likes_count?: number;             // 연속 좋아요 횟수
}
```

---

## 5. 👤 프로필 (Profile) - 품질 & 완성도

### 현재 있는 지표
- `Profile_Viewed`, `Profile_Photo_Uploaded`, `Profile_Completion_Updated`

### 추가 추천 지표

```typescript
// 프로필 편집
PROFILE_EDIT_STARTED: 'Profile_Edit_Started',
PROFILE_EDIT_COMPLETED: 'Profile_Edit_Completed',
PROFILE_EDIT_ABANDONED: 'Profile_Edit_Abandoned',               // 편집 중 이탈

// 사진 관리
PROFILE_PHOTO_ADDED: 'Profile_Photo_Added',
PROFILE_PHOTO_DELETED: 'Profile_Photo_Deleted',
PROFILE_PHOTO_REORDERED: 'Profile_Photo_Reordered',
PROFILE_PHOTO_SET_AS_PRIMARY: 'Profile_Photo_Set_As_Primary',   // 대표 사진 변경
PROFILE_PHOTO_AI_ENHANCED: 'Profile_Photo_AI_Enhanced',         // AI 보정 사용

// 텍스트 정보
PROFILE_BIO_UPDATED: 'Profile_Bio_Updated',
PROFILE_BIO_LENGTH_TRACKED: 'Profile_Bio_Length_Tracked',
PROFILE_INTEREST_ADDED: 'Profile_Interest_Added',
PROFILE_INTEREST_REMOVED: 'Profile_Interest_Removed',
PROFILE_JOB_UPDATED: 'Profile_Job_Updated',
PROFILE_EDUCATION_UPDATED: 'Profile_Education_Updated',

// 프로필 인증
PROFILE_VERIFICATION_STARTED: 'Profile_Verification_Started',
PROFILE_VERIFICATION_COMPLETED: 'Profile_Verification_Completed',
PROFILE_VERIFICATION_FAILED: 'Profile_Verification_Failed',
PROFILE_VERIFICATION_BADGE_EARNED: 'Profile_Verification_Badge_Earned',

// 프로필 품질
PROFILE_QUALITY_SCORE_UPDATED: 'Profile_Quality_Score_Updated', // 자동 품질 점수
PROFILE_QUALITY_TIP_SHOWN: 'Profile_Quality_Tip_Shown',         // "사진을 더 추가하세요"
PROFILE_QUALITY_TIP_FOLLOWED: 'Profile_Quality_Tip_Followed',

// 프로필 공유
PROFILE_SHARED: 'Profile_Shared',
PROFILE_LINK_COPIED: 'Profile_Link_Copied',
PROFILE_SCREENSHOT_DETECTED: 'Profile_Screenshot_Detected',     // 스크린샷 감지

// 프로필 조회 (다른 사용자가)
PROFILE_VIEW_SOURCE_TRACKED: 'Profile_View_Source_Tracked',     // 어디서 프로필을 봤는지
PROFILE_VIEW_DURATION: 'Profile_View_Duration',                 // 프로필을 본 시간
```

#### 속성 정의
```typescript
export interface ProfileDetailedEventProperties extends BaseEventProperties {
  profile_completion_percentage?: number;       // 0-100
  photo_count?: number;
  bio_length?: number;
  interests_count?: number;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'failed';
  quality_score?: number;                       // 0-100
  quality_issues?: string[];                    // ["no_bio", "low_quality_photo"]
  edit_duration_seconds?: number;
  fields_updated?: string[];                    // ["bio", "interests", "job"]
  view_source?: 'search' | 'matching' | 'like_list' | 'chat' | 'community';
  view_duration_seconds?: number;
  is_own_profile?: boolean;
}
```

---

## 6. 🌐 커뮤니티 (Community) - 참여 & 콘텐츠

### 현재 있는 지표
- `Article_Created`, `Article_Liked`, `Article_Commented`, `Article_Shared`, `Article_Viewed`
- `Article_Bookmarked`, `Article_Reported`

### 추가 추천 지표

```typescript
// 커뮤니티 탐색
COMMUNITY_SEARCH_PERFORMED: 'Community_Search_Performed',
COMMUNITY_SEARCH_RESULTS_CLICKED: 'Community_Search_Results_Clicked',
COMMUNITY_FILTER_APPLIED: 'Community_Filter_Applied',
COMMUNITY_SORT_CHANGED: 'Community_Sort_Changed',               // 정렬: 인기순, 최신순
COMMUNITY_CATEGORY_SWITCHED: 'Community_Category_Switched',

// 게시글 작성
ARTICLE_DRAFT_SAVED: 'Article_Draft_Saved',
ARTICLE_DRAFT_DELETED: 'Article_Draft_Deleted',
ARTICLE_DRAFT_RESTORED: 'Article_Draft_Restored',
ARTICLE_EDIT_STARTED: 'Article_Edit_Started',
ARTICLE_EDIT_COMPLETED: 'Article_Edit_Completed',
ARTICLE_DELETED_BY_AUTHOR: 'Article_Deleted_By_Author',
ARTICLE_DELETED_BY_ADMIN: 'Article_Deleted_By_Admin',

// 투표/설문
ARTICLE_POLL_CREATED: 'Article_Poll_Created',
ARTICLE_POLL_VOTED: 'Article_Poll_Voted',
ARTICLE_POLL_RESULTS_VIEWED: 'Article_Poll_Results_Viewed',

// 댓글 심화
COMMENT_LIKED: 'Comment_Liked',
COMMENT_REPLIED: 'Comment_Replied',
COMMENT_REPORTED: 'Comment_Reported',
COMMENT_DELETED_BY_AUTHOR: 'Comment_Deleted_By_Author',
COMMENT_DELETED_BY_ADMIN: 'Comment_Deleted_By_Admin',
COMMENT_MENTION_USED: 'Comment_Mention_Used',                   // @username

// 트렌딩 & 추천
TRENDING_ARTICLE_VIEWED: 'Trending_Article_Viewed',
RECOMMENDED_ARTICLE_CLICKED: 'Recommended_Article_Clicked',
COMMUNITY_HOT_TOPIC_VIEWED: 'Community_Hot_Topic_Viewed',

// 알림 설정
COMMUNITY_NOTIFICATION_SETTINGS_CHANGED: 'Community_Notification_Settings_Changed',
COMMUNITY_POST_FOLLOW_ENABLED: 'Community_Post_Follow_Enabled', // 게시글 팔로우

// 사용자 상호작용
COMMUNITY_AUTHOR_PROFILE_VIEWED: 'Community_Author_Profile_Viewed',
COMMUNITY_AUTHOR_FOLLOWED: 'Community_Author_Followed',
COMMUNITY_AUTHOR_BLOCKED: 'Community_Author_Blocked',
```

#### 속성 정의
```typescript
export interface CommunityDetailedEventProperties extends CommunityEventProperties {
  article_length?: number;
  image_count?: number;
  poll_options_count?: number;
  comment_count?: number;
  like_count?: number;
  share_count?: number;
  view_count?: number;
  time_to_first_interaction?: number;           // 게시글 본 후 첫 액션까지 시간
  search_query?: string;
  filter_type?: 'category' | 'author' | 'date' | 'popularity';
  sort_type?: 'recent' | 'popular' | 'trending';
  is_author?: boolean;
  author_follower_count?: number;
}
```

---

## 7. 🔔 알림 (Notification) - 참여 유도

### 현재 있는 지표
- `Push_Notification_Opened`

### 추가 추천 지표

```typescript
// 알림 수신
NOTIFICATION_RECEIVED: 'Notification_Received',
NOTIFICATION_DELIVERED: 'Notification_Delivered',
NOTIFICATION_FAILED: 'Notification_Failed',

// 알림 상호작용
NOTIFICATION_CLICKED: 'Notification_Clicked',
NOTIFICATION_DISMISSED: 'Notification_Dismissed',
NOTIFICATION_ACTION_TAKEN: 'Notification_Action_Taken',         // Quick Reply 등

// 알림 설정
NOTIFICATION_SETTINGS_OPENED: 'Notification_Settings_Opened',
NOTIFICATION_SETTINGS_UPDATED: 'Notification_Settings_Updated',
NOTIFICATION_CHANNEL_ENABLED: 'Notification_Channel_Enabled',   // 채팅, 매칭, 커뮤니티 등
NOTIFICATION_CHANNEL_DISABLED: 'Notification_Channel_Disabled',

// 권한 관리
NOTIFICATION_PERMISSION_REQUESTED: 'Notification_Permission_Requested',
NOTIFICATION_PERMISSION_GRANTED: 'Notification_Permission_Granted',
NOTIFICATION_PERMISSION_DENIED: 'Notification_Permission_Denied',
NOTIFICATION_PERMISSION_REVOKED: 'Notification_Permission_Revoked',

// 수신 관리
NOTIFICATION_OPTED_OUT: 'Notification_Opted_Out',
NOTIFICATION_OPTED_IN: 'Notification_Opted_In',
NOTIFICATION_QUIET_HOURS_ENABLED: 'Notification_Quiet_Hours_Enabled',
NOTIFICATION_FREQUENCY_CHANGED: 'Notification_Frequency_Changed',

// 인앱 알림
IN_APP_NOTIFICATION_SHOWN: 'In_App_Notification_Shown',
IN_APP_NOTIFICATION_CLICKED: 'In_App_Notification_Clicked',
IN_APP_NOTIFICATION_DISMISSED: 'In_App_Notification_Dismissed',

// 알림 캠페인
NOTIFICATION_CAMPAIGN_SENT: 'Notification_Campaign_Sent',       // 마케팅 푸시
NOTIFICATION_CAMPAIGN_OPENED: 'Notification_Campaign_Opened',
NOTIFICATION_CAMPAIGN_CONVERTED: 'Notification_Campaign_Converted',
```

#### 속성 정의
```typescript
export interface NotificationDetailedEventProperties extends BaseEventProperties {
  notification_type?: 'match' | 'message' | 'like' | 'comment' | 'system' | 'marketing';
  notification_channel?: 'push' | 'in_app' | 'email' | 'sms';
  notification_priority?: 'high' | 'medium' | 'low';
  notification_title?: string;
  time_to_open?: number;                        // 알림 받고 열기까지 시간
  is_batch_notification?: boolean;              // 일괄 알림 여부
  notification_group?: string;                  // 알림 그룹 ID
  action_type?: 'quick_reply' | 'deep_link' | 'dismiss';
  campaign_id?: string;
  campaign_name?: string;
}
```

---

## 8. 🎯 온보딩 & 리텐션

### 현재 있는 지표
- `Onboarding_Started`, `Onboarding_Completed`, `Onboarding_Step_Completed`
- `Session_Started`, `Session_Ended`

### 추가 추천 지표

```typescript
// 온보딩 완성도
ONBOARDING_TUTORIAL_STARTED: 'Onboarding_Tutorial_Started',
ONBOARDING_TUTORIAL_COMPLETED: 'Onboarding_Tutorial_Completed',
ONBOARDING_TUTORIAL_SKIPPED: 'Onboarding_Tutorial_Skipped',
ONBOARDING_TUTORIAL_STEP_COMPLETED: 'Onboarding_Tutorial_Step_Completed',
ONBOARDING_ABANDONED: 'Onboarding_Abandoned',

// 첫 경험 (First-Time User Experience)
FIRST_MATCH_ACHIEVED: 'First_Match_Achieved',
FIRST_MESSAGE_SENT: 'First_Message_Sent',
FIRST_MESSAGE_RECEIVED: 'First_Message_Received',
FIRST_LIKE_SENT: 'First_Like_Sent',
FIRST_LIKE_RECEIVED: 'First_Like_Received',
FIRST_PROFILE_VIEW: 'First_Profile_View',
FIRST_COMMUNITY_POST: 'First_Community_Post',
FIRST_PAYMENT: 'First_Payment',

// 리텐션 코호트
DAY_1_RETENTION: 'Day_1_Retention',
DAY_3_RETENTION: 'Day_3_Retention',
DAY_7_RETENTION: 'Day_7_Retention',
DAY_30_RETENTION: 'Day_30_Retention',
WEEK_1_RETENTION: 'Week_1_Retention',
WEEK_2_RETENTION: 'Week_2_Retention',

// 이탈 & 복귀
USER_DORMANT: 'User_Dormant',                                   // 7일 미접속
USER_CHURNED: 'User_Churned',                                   // 30일 미접속
DORMANT_USER_RETURNED: 'Dormant_User_Returned',
CHURNED_USER_RETURNED: 'Churned_User_Returned',

// 재참여 캠페인
RE_ENGAGEMENT_CAMPAIGN_SENT: 'Re_Engagement_Campaign_Sent',
RE_ENGAGEMENT_CAMPAIGN_OPENED: 'Re_Engagement_Campaign_Opened',
RE_ENGAGEMENT_CAMPAIGN_CONVERTED: 'Re_Engagement_Campaign_Converted',
WIN_BACK_OFFER_SHOWN: 'Win_Back_Offer_Shown',                  // 복귀 혜택

// 습관 형성
STREAK_STARTED: 'Streak_Started',                               // 연속 접속 시작
STREAK_CONTINUED: 'Streak_Continued',
STREAK_BROKEN: 'Streak_Broken',
STREAK_MILESTONE_REACHED: 'Streak_Milestone_Reached',          // 7일, 30일 등
```

---

## 9. 📱 사용자 행동 & 참여도

### 현재 있는 지표
- `App_Opened`, `App_Backgrounded`, `Feature_Used`

### 추가 추천 지표

```typescript
// 활성 사용자 추적
DAILY_ACTIVE_USER: 'Daily_Active_User',
WEEKLY_ACTIVE_USER: 'Weekly_Active_User',
MONTHLY_ACTIVE_USER: 'Monthly_Active_User',

// 세션 분석
SESSION_LENGTH_TRACKED: 'Session_Length_Tracked',
SESSION_COUNT_PER_DAY: 'Session_Count_Per_Day',
SESSION_DEPTH: 'Session_Depth',                                 // 방문한 화면 수

// 화면 조회
SCREEN_VIEW: 'Screen_View',
SCREEN_TIME_TRACKED: 'Screen_Time_Tracked',
SCREEN_EXIT: 'Screen_Exit',

// 딥링크 & 공유
DEEP_LINK_OPENED: 'Deep_Link_Opened',
DEEP_LINK_FAILED: 'Deep_Link_Failed',
SHARE_INITIATED: 'Share_Initiated',
SHARE_COMPLETED: 'Share_Completed',
SHARE_CANCELLED: 'Share_Cancelled',

// 앱 업데이트
APP_UPDATED: 'App_Updated',
APP_UPDATE_PROMPT_SHOWN: 'App_Update_Prompt_Shown',
APP_UPDATE_INSTALLED: 'App_Update_Installed',
APP_UPDATE_SKIPPED: 'App_Update_Skipped',

// 오류 & 성능
APP_CRASH_REPORTED: 'App_Crash_Reported',
APP_ERROR_ENCOUNTERED: 'App_Error_Encountered',
NETWORK_ERROR_ENCOUNTERED: 'Network_Error_Encountered',
API_ERROR_ENCOUNTERED: 'API_Error_Encountered',
SLOW_PERFORMANCE_DETECTED: 'Slow_Performance_Detected',         // 로딩 3초 이상

// 디바이스 & 환경
APP_OPENED_AFTER_BACKGROUND: 'App_Opened_After_Background',
APP_ORIENTATION_CHANGED: 'App_Orientation_Changed',
LOW_BATTERY_DETECTED: 'Low_Battery_Detected',
LOW_STORAGE_DETECTED: 'Low_Storage_Detected',
```

---

## 10. 🧪 A/B 테스트 & 실험

### 추가 추천 지표

```typescript
// 실험 할당
EXPERIMENT_ASSIGNED: 'Experiment_Assigned',
EXPERIMENT_VARIATION_VIEWED: 'Experiment_Variation_Viewed',
EXPERIMENT_CONVERSION: 'Experiment_Conversion',

// 기능 플래그
FEATURE_FLAG_EVALUATED: 'Feature_Flag_Evaluated',
FEATURE_FLAG_ENABLED: 'Feature_Flag_Enabled',
FEATURE_FLAG_DISABLED: 'Feature_Flag_Disabled',

// 신기능 발견
FEATURE_DISCOVERY: 'Feature_Discovery',                         // 새 기능 발견
FEATURE_FIRST_USE: 'Feature_First_Use',
FEATURE_TOOLTIP_SHOWN: 'Feature_Tooltip_Shown',
FEATURE_TOOLTIP_DISMISSED: 'Feature_Tooltip_Dismissed',

// 피드백
FEATURE_FEEDBACK_REQUESTED: 'Feature_Feedback_Requested',
FEATURE_FEEDBACK_SUBMITTED: 'Feature_Feedback_Submitted',
BETA_FEATURE_OPTED_IN: 'Beta_Feature_Opted_In',
```

---

## 구현 우선순위

### 🔴 High Priority (즉시 구현 - 비즈니스 크리티컬)

1. **결제 퍼널**
   - `PAYMENT_ABANDONED_CART` - 결제 이탈 방지
   - `PAYMENT_FIRST_PURCHASE` - 첫 구매 전환율
   - `GEM_BALANCE_LOW` - 재구매 유도

2. **매칭 효율**
   - `MATCHING_QUEUE_TIME` - 대기 시간 최적화
   - `LIKE_MATCH_CREATED` - 좋아요 → 매칭 전환율

3. **리텐션**
   - `DAY_1_RETENTION`, `DAY_7_RETENTION` - 코호트 분석
   - `FIRST_MATCH_ACHIEVED` - Aha Moment 추적

4. **채팅 품질**
   - `CHAT_FIRST_RESPONSE_TIME` - 대화 품질
   - `CHAT_CONVERSATION_LENGTH` - 참여도

### 🟡 Medium Priority (2-4주 내)

- 알림 최적화 지표
- 프로필 품질 지표
- 커뮤니티 참여 지표

### 🟢 Low Priority (장기)

- A/B 테스트 인프라
- 고급 세그멘테이션 지표

---

## 다음 단계

### 1. 기술 구현
```bash
# src/shared/constants/mixpanel-events.ts에 이벤트 추가
# 각 feature별 tracking 코드 추가
```

### 2. 대시보드 설정
- Mixpanel에서 주요 지표 대시보드 생성
- 일일/주간 리포트 자동화

### 3. 알림 설정
- 이상치 감지 (예: 결제 실패율 20% 이상)
- 목표 달성 알림 (예: DAU 1000명 돌파)

---

## 참고: AARRR 매핑

| AARRR 단계 | 핵심 지표 |
|-----------|----------|
| **Acquisition** (획득) | `APP_INSTALL_PROMPT_INSTALL_CLICKED`, `SIGNUP_STARTED` |
| **Activation** (활성화) | `FIRST_MATCH_ACHIEVED`, `FIRST_MESSAGE_SENT`, `PROFILE_COMPLETION_UPDATED` |
| **Retention** (리텐션) | `DAY_7_RETENTION`, `CHAT_24h_Active`, `SESSION_LENGTH_TRACKED` |
| **Revenue** (수익) | `PAYMENT_FIRST_PURCHASE`, `SUBSCRIPTION_STARTED`, `GEM_PURCHASE_PROMPT_SHOWN` |
| **Referral** (추천) | `REFERRAL_INVITE_SENT`, `INVITE_CONVERSION_COMPLETED` |

---

**작성일**: 2025-12-29
**버전**: v1.0
**다음 업데이트**: 구현 후 실제 데이터 기반 조정
