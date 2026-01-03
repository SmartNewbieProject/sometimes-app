# Mixpanel 이벤트 레퍼런스

총 **153개** 이벤트 (AARRR 프레임워크 기반)

**최종 업데이트**: 2026-01-03

---

## 목차

1. [회원가입/인증 이벤트 (27개)](#1-회원가입인증-이벤트-27개)
2. [매칭 이벤트 (21개)](#2-매칭-이벤트-21개)
3. [온보딩 이벤트 (5개)](#3-온보딩-이벤트-5개)
4. [좋아요 이벤트 (11개)](#4-좋아요-이벤트-11개)
5. [채팅 이벤트 (14개)](#5-채팅-이벤트-14개)
6. [커뮤니티 이벤트 (16개)](#6-커뮤니티-이벤트-16개)
7. [결제/수익 이벤트 (24개)](#7-결제수익-이벤트-24개)
8. [모먼트 이벤트 (4개)](#8-모먼트-이벤트-4개)
9. [추천/초대 이벤트 (6개)](#9-추천초대-이벤트-6개)
10. [세션/앱 사용 이벤트 (7개)](#10-세션앱-사용-이벤트-7개)
11. [썸메이트(AI 채팅) 이벤트 (12개)](#11-썸메이트ai-채팅-이벤트-12개)
12. [리텐션 이벤트 (7개)](#12-리텐션-이벤트-7개)
13. [프로필 이벤트 (2개)](#13-프로필-이벤트-2개)
14. [인앱 리뷰 이벤트 (4개)](#14-인앱-리뷰-이벤트-4개)
15. [기타 이벤트 (6개)](#15-기타-이벤트-6개)
16. [사용자 관리 이벤트 (4개)](#16-사용자-관리-이벤트-4개)
17. [앱 설치 유도 이벤트 (3개)](#17-앱-설치-유도-이벤트-3개)
18. [서버 전용 매칭 파이프라인 이벤트 (7개)](#18-서버-전용-매칭-파이프라인-이벤트-7개)

---

## 1. 회원가입/인증 이벤트 (27개)

### `Signup_Login_View`
- **목적**: 로그인 화면 진입 추적
- **동작조건**: 로그인/회원가입 화면 진입 시
- **메타데이터**: `env`, `timestamp`, `session_id`

### `Signup_Auth_Started`
- **목적**: 인증 프로세스 시작 추적
- **동작조건**: 인증 버튼(PASS/카카오/애플) 클릭 시
- **메타데이터**: `auth_method` (pass/kakao/apple)

### `Signup_University_View`
- **목적**: 대학 선택 화면 도달 추적
- **동작조건**: 대학 인증 화면 진입 시
- **메타데이터**: `source`

### `Signup_Details_View`
- **목적**: 상세정보 입력 화면 도달 추적
- **동작조건**: 프로필 상세 입력 화면 진입 시
- **메타데이터**: `source`

### `Signup_Profile_View`
- **목적**: 프로필 사진 화면 도달 추적
- **동작조건**: 프로필 사진 업로드 화면 진입 시
- **메타데이터**: `source`

### `Signup_Init`
- **목적**: 회원가입 초기화 추적
- **동작조건**: 회원가입 프로세스 시작 시
- **메타데이터**: `source`

### `Signup_Route_Entered`
- **목적**: 회원가입 라우트 진입 추적
- **동작조건**: 회원가입 관련 라우트 진입 시
- **메타데이터**: `source`

### `Signup_university`
- **목적**: 대학 선택 완료 추적
- **동작조건**: 대학 선택 후 다음 단계 진행 시
- **메타데이터**: `source`

### `Singup_university_details`
- **목적**: 대학 상세정보(학과/학년) 입력 추적
- **동작조건**: 학과, 학년 정보 입력 완료 시
- **메타데이터**: `source`

### `Signup_instagram_entered`
- **목적**: 인스타그램 계정 연동 추적
- **동작조건**: 인스타그램 ID 입력 시
- **메타데이터**: `source`

### `Signup_instagram_skipped`
- **목적**: 인스타그램 연동 건너뛰기 추적
- **동작조건**: 인스타그램 연동 스킵 시
- **메타데이터**: `source`

### `Signup_profile_image`
- **목적**: 프로필 사진 업로드 추적
- **동작조건**: 프로필 사진 업로드 완료 시
- **메타데이터**: `image_count`

### `Signup_profile_image_error`
- **목적**: 프로필 사진 업로드 오류 추적
- **동작조건**: 프로필 사진 업로드 실패 시
- **메타데이터**: `error_type`

### `Signup_profile_invite_code_error`
- **목적**: 초대코드 입력 오류 추적
- **동작조건**: 유효하지 않은 초대코드 입력 시
- **메타데이터**: `error_type`

### `Signup_AgeCheck_Failed`
- **목적**: 나이 제한 체크 실패 추적
- **동작조건**: 만 18세 미만 사용자 감지 시
- **메타데이터**: `source`

### `Signup_PhoneBlacklist_Failed`
- **목적**: 블랙리스트 전화번호 감지 추적
- **동작조건**: 차단된 전화번호로 가입 시도 시
- **메타데이터**: `source`

### `Signup_Error`
- **목적**: 회원가입 일반 오류 추적
- **동작조건**: 회원가입 과정 중 오류 발생 시
- **메타데이터**: `error_type`

### `Signup_Started`
- **목적**: 회원가입 시작 추적 (KPI)
- **동작조건**: 회원가입 프로세스 시작 시
- **메타데이터**: `source`, `total_duration`

### `Signup_Profile_Image_Uploaded`
- **목적**: 프로필 사진 업로드 완료 추적 (KPI)
- **동작조건**: 프로필 사진 업로드 성공 시
- **메타데이터**: `image_count`, `profile_completion_rate`

### `Signup_Interest_Selected`
- **목적**: 관심사 선택 추적
- **동작조건**: 관심사 선택 완료 시
- **메타데이터**: `category`, `selection_count`

### `Signup_done` / `signup_complete`
- **목적**: 회원가입 최종 완료 추적
- **동작조건**: 회원가입 전체 완료 시 (서버)
- **메타데이터**: `source`, `total_duration`, `profile_completion_rate`

### `Auth_Login_Started`
- **목적**: 로그인 시작 추적
- **동작조건**: 로그인 버튼 클릭 시
- **메타데이터**: `auth_method`

### `Auth_Login_Completed`
- **목적**: 로그인 성공 추적
- **동작조건**: 로그인 성공 시
- **메타데이터**: `auth_method`, `login_duration`

### `Auth_Login_Failed`
- **목적**: 로그인 실패 추적
- **동작조건**: 로그인 실패 시
- **메타데이터**: `auth_method`, `error_type`

### `Auth_Login_Abandoned`
- **목적**: 로그인 이탈 추적
- **동작조건**: 로그인 과정 중 이탈 시
- **메타데이터**: `auth_method`, `abandoned_step`, `time_spent_seconds`, `is_retry`, `retry_count`

### `Auth_Logout`
- **목적**: 로그아웃 추적
- **동작조건**: 로그아웃 버튼 클릭 시
- **메타데이터**: `reason` (manual/session_expired/account_deleted)

### `Account_Deletion_Requested`
- **목적**: 계정 삭제 요청 추적
- **동작조건**: 회원 탈퇴 요청 시
- **메타데이터**: `deletion_reason`, `days_since_signup`, `total_matches_count`, `has_purchased`, `total_spent`

---

## 2. 매칭 이벤트 (21개)

### `Matching_Started`
- **목적**: 매칭 시작 추적
- **동작조건**: 매칭 버튼 클릭 시
- **메타데이터**: `matching_type` (auto/manual/rematch)

### `Matching_Profile_Viewed`
- **목적**: 매칭 프로필 카드 조회 추적
- **동작조건**: 매칭 결과 프로필 표시 시
- **메타데이터**: `profile_id`, `view_duration`

### `Matching_Requested`
- **목적**: 매칭 요청 추적
- **동작조건**: 매칭 요청 버튼 클릭 시
- **메타데이터**: `matching_type`, `gem_cost`

### `Matching_Success`
- **목적**: 매칭 성공 추적
- **동작조건**: 매칭 성사 시 (서버)
- **메타데이터**: `matching_type`, `time_to_match`

### `Matching_Failed`
- **목적**: 매칭 실패 추적
- **동작조건**: 매칭 실패 응답 시
- **메타데이터**: `error_reason`, `retry_available_at`, `failure_category`, `is_recoverable`

### `Profile_Viewed`
- **목적**: 프로필 상세 조회 추적
- **동작조건**: 프로필 상세 화면 진입 시
- **메타데이터**: `viewed_profile_id`, `view_source`, `partner_age`, `partner_university`

### `Filter_Applied`
- **목적**: 매칭 필터 적용 추적
- **동작조건**: 필터 설정 변경 시
- **메타데이터**: `filter_type`, `filter_value`, `previous_value`

### `Expand_Region_Empty_Viewed`
- **목적**: 지역 확장 Empty State 노출 추적
- **동작조건**: 매칭 대기 중 Empty State 표시 시
- **메타데이터**: `time_on_screen`

### `Expand_Region_Empty_Action`
- **목적**: 지역 확장 Empty State 액션 추적
- **동작조건**: 대기/해제 버튼 클릭 시
- **메타데이터**: `action` (wait/dismiss), `time_on_screen`

### `Match_Request_Sent`
- **목적**: 매칭 요청 전송 추적
- **동작조건**: 매칭 요청 서버 전송 시
- **메타데이터**: `matching_type`, `gem_cost`

### `Match_Accepted`
- **목적**: 매칭 수락 추적
- **동작조건**: 상대방이 매칭 수락 시 (서버)
- **메타데이터**: `profile_id`, `time_to_response`

### `Match_Rejected`
- **목적**: 매칭 거절 추적
- **동작조건**: 상대방이 매칭 거절 시 (서버)
- **메타데이터**: `profile_id`

### `Match_Card_Viewed`
- **목적**: 매칭 카드 조회 추적
- **동작조건**: 매칭 결과 카드 표시 시
- **메타데이터**: `profile_id`, `view_duration`

### `Match_Time_To_Response`
- **목적**: 매칭 응답 시간 추적
- **동작조건**: 매칭 요청에 대한 응답 시
- **메타데이터**: `response_time`, `profile_id`

### `First_Message_Sent_After_Match`
- **목적**: 매칭 후 첫 메시지 전송 추적
- **동작조건**: 매칭 성사 후 첫 메시지 전송 시
- **메타데이터**: `chat_id`, `time_since_match`

### `Matching_Queue_Joined`
- **목적**: 매칭 대기열 진입 추적
- **동작조건**: 매칭 대기열 진입 시
- **메타데이터**: `matching_type`, `queue_position`, `estimated_wait_time`

### `Matching_Queue_Time`
- **목적**: 매칭 대기 시간 측정
- **동작조건**: 매칭 완료/이탈 시
- **메타데이터**: `queue_wait_time_seconds`, `queue_abandoned`

### `Matching_Queue_Abandoned`
- **목적**: 매칭 대기 이탈 추적
- **동작조건**: 매칭 대기 중 이탈 시
- **메타데이터**: `queue_wait_time_seconds`

### `Match_Conversation_Rate`
- **목적**: 매칭 후 대화율 추적
- **동작조건**: 매칭 후 24시간 대화 여부 확인 시 (서버 배치)
- **메타데이터**: `has_conversation`, `time_to_first_message`

### `First_Match_Achieved`
- **목적**: 첫 매칭 성공 추적 (Aha Moment)
- **동작조건**: 사용자의 첫 매칭 성사 시
- **메타데이터**: `time_to_first_action`, `signup_date`, `profile_completion_rate`

---

## 3. 온보딩 이벤트 (5개)

### `Onboarding_Started`
- **목적**: 온보딩 시작 추적
- **동작조건**: 온보딩 화면 진입 시
- **메타데이터**: `source`

### `Onboarding_Completed`
- **목적**: 온보딩 완료 추적
- **동작조건**: 온보딩 전체 완료 시
- **메타데이터**: `total_duration`, `profile_completion_rate`

### `Onboarding_Step_Completed`
- **목적**: 온보딩 단계별 완료 추적
- **동작조건**: 온보딩 각 단계 완료 시
- **메타데이터**: `step_name`

### `University_Verification_Started`
- **목적**: 대학 인증 시작 추적
- **동작조건**: 대학 인증 프로세스 시작 시 (서버)
- **메타데이터**: `source`

### `University_Verification_Completed`
- **목적**: 대학 인증 완료 추적
- **동작조건**: 대학 인증 성공 시 (서버)
- **메타데이터**: `source`

---

## 4. 좋아요 이벤트 (11개)

### `Like_Sent`
- **목적**: 좋아요 전송 추적
- **동작조건**: 좋아요 버튼 클릭 시
- **메타데이터**: `target_profile_id`, `like_type` (free/super)

### `Like_Received`
- **목적**: 좋아요 수신 추적
- **동작조건**: 상대방이 좋아요 전송 시 (서버)
- **메타데이터**: `source_profile_id`, `like_type`

### `Like_List_Viewed`
- **목적**: 좋아요 목록 조회 추적
- **동작조건**: 좋아요 화면 진입 시
- **메타데이터**: `source`

### `Like_Rejected`
- **목적**: 좋아요 거절 추적
- **동작조건**: 좋아요 거절 버튼 클릭 시
- **메타데이터**: `target_profile_id`

### `Like_Cancelled`
- **목적**: 좋아요 취소 추적
- **동작조건**: 좋아요 취소 시
- **메타데이터**: `target_profile_id`

### `Like_Match_Created`
- **목적**: 좋아요로 매칭 성사 추적
- **동작조건**: 상호 좋아요로 매칭 시 (서버)
- **메타데이터**: `target_profile_id`, `is_mutual`, `match_created`

### `Like_Mutual_Match`
- **목적**: 상호 좋아요 추적
- **동작조건**: 양방향 좋아요 성사 시
- **메타데이터**: `target_profile_id`, `is_mutual`, `time_to_response`

### `Like_Limit_Reached`
- **목적**: 좋아요 한도 도달 추적
- **동작조건**: 일일 좋아요 한도 도달 시
- **메타데이터**: `likes_remaining`

### `First_Like_Sent`
- **목적**: 첫 좋아요 전송 추적 (Aha Moment)
- **동작조건**: 사용자의 첫 좋아요 전송 시
- **메타데이터**: `time_to_first_action`, `signup_date`, `profile_completion_rate`

### `First_Like_Received`
- **목적**: 첫 좋아요 수신 추적 (Aha Moment)
- **동작조건**: 사용자의 첫 좋아요 수신 시
- **메타데이터**: `time_to_first_action`, `signup_date`

---

## 5. 채팅 이벤트 (14개)

### `Chat_Started`
- **목적**: 채팅 시작 추적
- **동작조건**: 채팅방 진입 시
- **메타데이터**: `chat_partner_id`, `chat_id`

### `Chat_Message_Sent`
- **목적**: 메시지 전송 추적
- **동작조건**: 메시지 전송 시
- **메타데이터**: `chat_id`, `message_type`, `is_first_message`

### `Chat_Ended`
- **목적**: 채팅 종료 추적
- **동작조건**: 채팅방 나가기 시
- **메타데이터**: `chat_id`, `chat_duration`, `message_count`, `end_reason`

### `Chat_Gift_Sent`
- **목적**: 선물 전송 추적
- **동작조건**: 채팅 중 선물 전송 시
- **메타데이터**: `chat_id`, `gift_type`

### `Chat_Response`
- **목적**: 채팅 응답 추적
- **동작조건**: 상대방 응답 감지 시 (서버)
- **메타데이터**: `chat_id`, `response_time`

### `Chat_24h_Active`
- **목적**: 24시간 활성 대화 추적
- **동작조건**: 매칭 후 24시간 내 대화 발생 시 (서버 배치)
- **메타데이터**: `chat_room_id`, `match_id`, `is_active`, `is_mutual_conversation`, `activity_status`, `my_message_count`, `partner_message_count`

### `First_Message_Sent`
- **목적**: 첫 메시지 전송 추적 (Aha Moment)
- **동작조건**: 사용자의 첫 메시지 전송 시
- **메타데이터**: `time_to_first_action`, `signup_date`, `profile_completion_rate`

### `First_Message_Received`
- **목적**: 첫 메시지 수신 추적 (Aha Moment)
- **동작조건**: 사용자의 첫 메시지 수신 시
- **메타데이터**: `time_to_first_action`, `signup_date`

### `Chat_First_Response_Time`
- **목적**: 첫 응답 시간 측정
- **동작조건**: 첫 메시지에 대한 응답 시
- **메타데이터**: `chat_id`, `response_time_seconds`, `is_first_interaction`

### `Chat_Average_Response_Time`
- **목적**: 평균 응답 시간 측정
- **동작조건**: 채팅 종료 또는 주기적 측정 시
- **메타데이터**: `chat_id`, `response_time_seconds`

### `Chat_Conversation_Length`
- **목적**: 대화 길이(메시지 수) 측정
- **동작조건**: 채팅 종료 시
- **메타데이터**: `chat_id`, `conversation_turn_count`, `message_count`

### `Chat_Conversation_Duration`
- **목적**: 대화 지속 시간 측정
- **동작조건**: 채팅 종료 시
- **메타데이터**: `chat_id`, `chat_duration`

---

## 6. 커뮤니티 이벤트 (16개)

### `Article_Created`
- **목적**: 게시글 작성 추적
- **동작조건**: 게시글 작성 완료 시
- **메타데이터**: `category`, `has_image`

### `Article_Liked`
- **목적**: 게시글 좋아요 추적
- **동작조건**: 게시글 좋아요 버튼 클릭 시
- **메타데이터**: `post_id`

### `Article_Commented`
- **목적**: 댓글 작성 추적
- **동작조건**: 댓글 작성 완료 시
- **메타데이터**: `post_id`, `comment_length`

### `Article_Shared`
- **목적**: 게시글 공유 추적
- **동작조건**: 게시글 공유 버튼 클릭 시
- **메타데이터**: `post_id`, `share_platform`

### `Article_Viewed`
- **목적**: 게시글 조회 추적
- **동작조건**: 게시글 상세 진입 시
- **메타데이터**: `post_id`, `view_duration`

### `Article_Bookmarked`
- **목적**: 북마크 추가 추적
- **동작조건**: 북마크 버튼 클릭 시
- **메타데이터**: `post_id`

### `Article_Reported`
- **목적**: 게시글 신고 추적
- **동작조건**: 게시글 신고 시
- **메타데이터**: `post_id`, `reason`

### `Community_Post_Created`
- **목적**: 포스트 작성 추적
- **동작조건**: 포스트 작성 완료 시
- **메타데이터**: `category`, `has_image`

### `Community_Post_Viewed`
- **목적**: 포스트 조회 추적
- **동작조건**: 포스트 상세 진입 시
- **메타데이터**: `post_id`, `view_duration`

### `Community_Post_Liked`
- **목적**: 포스트 좋아요 추적
- **동작조건**: 포스트 좋아요 버튼 클릭 시
- **메타데이터**: `post_id`

### `Community_Comment_Added`
- **목적**: 댓글 추가 추적
- **동작조건**: 댓글 작성 완료 시
- **메타데이터**: `post_id`, `comment_length`

### `Community_Post_Shared`
- **목적**: 포스트 공유 추적
- **동작조건**: 포스트 공유 버튼 클릭 시
- **메타데이터**: `post_id`, `share_platform`

### `Community_Feed_Viewed`
- **목적**: 피드 조회 추적
- **동작조건**: 커뮤니티 피드 진입 시 (서버)
- **메타데이터**: `source`

### `Community_Post_Reported`
- **목적**: 포스트 신고 추적
- **동작조건**: 포스트 신고 시 (서버)
- **메타데이터**: `post_id`, `reason`

### `Community_Post_Deleted`
- **목적**: 포스트 삭제 추적
- **동작조건**: 포스트 삭제 시 (서버)
- **메타데이터**: `post_id`

### `Community_Daily_Active_Users`
- **목적**: 커뮤니티 일간 활성 사용자 추적
- **동작조건**: 일일 배치 작업 시 (서버)
- **메타데이터**: `source`

---

## 7. 결제/수익 이벤트 (24개)

### `GemStore_FirstSale_7`
- **목적**: 첫 구매 프로모션 7젬 상품 추적
- **동작조건**: 7젬 프로모션 상품 구매 시
- **메타데이터**: `item_value`

### `GemStore_FirstSale_16`
- **목적**: 첫 구매 프로모션 16젬 상품 추적
- **동작조건**: 16젬 프로모션 상품 구매 시
- **메타데이터**: `item_value`

### `GemStore_FirstSale_27`
- **목적**: 첫 구매 프로모션 27젬 상품 추적
- **동작조건**: 27젬 프로모션 상품 구매 시
- **메타데이터**: `item_value`

### `GemStore_Payment_Success`
- **목적**: 젬 상점 결제 성공 추적
- **동작조건**: 결제 성공 시
- **메타데이터**: `item_value`, `payment_method`, `total_amount`

### `Payment_Initiated`
- **목적**: 결제 시작 추적
- **동작조건**: 결제 화면 진입 시
- **메타데이터**: `item_type`, `item_value`, `store_type`

### `Payment_Completed`
- **목적**: 결제 완료 추적 (검증)
- **동작조건**: PG사 결제 검증 완료 시 (서버)
- **메타데이터**: `transaction_id`, `total_amount`, `payment_method`, `items_purchased`

### `Payment_Failed`
- **목적**: 결제 실패 추적
- **동작조건**: 결제 실패 시
- **메타데이터**: `error_reason`, `payment_method`

### `Payment_Cancelled`
- **목적**: 결제 취소 추적
- **동작조건**: 결제 취소 버튼 클릭 시
- **메타데이터**: `item_type`, `item_value`

### `Payment_Store_Viewed`
- **목적**: 젬 상점 조회 추적
- **동작조건**: 젬 상점 화면 진입 시
- **메타데이터**: `store_type`

### `Payment_Item_Selected`
- **목적**: 상품 선택 추적
- **동작조건**: 상품 클릭 시
- **메타데이터**: `item_type`, `item_value`

### `Payment_Gem_Used`
- **목적**: 젬 사용 추적
- **동작조건**: 젬 소비 시
- **메타데이터**: `usage_type`, `gem_count`

### `Payment_Ticket_Used`
- **목적**: 티켓 사용 추적
- **동작조건**: 티켓 소비 시
- **메타데이터**: `usage_type`

### `Payment_Method_Added`
- **목적**: 결제수단 추가 추적
- **동작조건**: 카드 등록 시
- **메타데이터**: `payment_method`

### `Payment_Method_Removed`
- **목적**: 결제수단 삭제 추적
- **동작조건**: 카드 삭제 시
- **메타데이터**: `payment_method`

### `Payment_First_Purchase`
- **목적**: 첫 구매 추적
- **동작조건**: 사용자의 첫 결제 완료 시
- **메타데이터**: `total_amount`, `is_first_purchase`, `time_to_purchase`, `days_since_signup`

### `Payment_Repeat_Purchase`
- **목적**: 재구매 추적
- **동작조건**: 두 번째 이후 결제 완료 시
- **메타데이터**: `total_amount`, `is_first_purchase`

### `Payment_Abandoned_Cart`
- **목적**: 결제 이탈 추적
- **동작조건**: 결제 화면에서 이탈 시
- **메타데이터**: `cart_value`, `abandoned_step`, `abandoned_reason`

### `Payment_Abandoned_At_Step`
- **목적**: 결제 단계별 이탈 추적
- **동작조건**: 결제 특정 단계에서 이탈 시
- **메타데이터**: `abandoned_step` (item_selection/payment_method/confirmation/processing)

### `Gem_Balance_Low`
- **목적**: 젬 부족 감지 추적
- **동작조건**: 젬 사용 시 잔액 부족 감지
- **메타데이터**: `gem_balance_before`, `gem_required`, `gem_shortage`, `purchase_trigger`

### `Gem_Balance_Depleted`
- **목적**: 젬 0개 상태 추적
- **동작조건**: 젬 잔액 0 감지 시
- **메타데이터**: `purchase_trigger`

### `Gem_Purchase_Prompt_Shown`
- **목적**: 젬 구매 유도 모달 표시 추적
- **동작조건**: 젬 구매 유도 모달 표시 시
- **메타데이터**: `purchase_trigger`

### `Gem_Purchase_Prompt_Dismissed`
- **목적**: 젬 구매 유도 모달 닫기 추적
- **동작조건**: 젬 구매 유도 모달 닫기 시
- **메타데이터**: `purchase_trigger`

### `Rematch_Purchased`
- **목적**: 재매칭권 구매 추적
- **동작조건**: 재매칭권 구매 완료 시 (서버)
- **메타데이터**: `gem_cost`

### `Revenue_Per_User`
- **목적**: 사용자당 수익 추적
- **동작조건**: 수익 집계 시 (서버 배치)
- **메타데이터**: `total_revenue`, `purchase_count`

---

## 8. 구독 이벤트 (3개)

### `Subscription_Started`
- **목적**: 구독 시작 추적
- **동작조건**: 구독 시작 시 (서버)
- **메타데이터**: `subscription_tier`, `payment_method`

### `Subscription_Renewed`
- **목적**: 구독 갱신 추적
- **동작조건**: 구독 자동 갱신 시 (서버 Webhook)
- **메타데이터**: `subscription_tier`

### `Subscription_Cancelled`
- **목적**: 구독 취소 추적
- **동작조건**: 구독 취소 시 (서버)
- **메타데이터**: `subscription_tier`

---

## 9. 모먼트 이벤트 (4개)

### `Moment_Question_Viewed`
- **목적**: 모먼트 질문 조회 추적
- **동작조건**: 모먼트 화면 진입 시
- **메타데이터**: `question_id`, `question_category`

### `Moment_Answer_Submitted`
- **목적**: 모먼트 답변 제출 추적
- **동작조건**: 답변 작성 완료 시
- **메타데이터**: `question_id`, `answer_type`, `time_to_answer`

### `Moment_Answer_Shared`
- **목적**: 모먼트 답변 공유 추적
- **동작조건**: 답변 공유 버튼 클릭 시
- **메타데이터**: `question_id`, `share_platform`

### `Moment_Other_Answers_Viewed`
- **목적**: 다른 사람 답변 조회 추적
- **동작조건**: 다른 답변 목록 조회 시
- **메타데이터**: `question_id`, `answers_viewed`

---

## 10. 추천/초대 이벤트 (6개)

### `Referral_Invite_Sent`
- **목적**: 초대 전송 추적
- **동작조건**: 초대 버튼 클릭 시
- **메타데이터**: `invite_method`, `invite_code`

### `Referral_Invite_Accepted`
- **목적**: 초대 수락 추적
- **동작조건**: 초대 링크 클릭으로 앱 진입 시
- **메타데이터**: `invite_code`, `referrer_id`

### `Referral_Signup_Completed`
- **목적**: 추천으로 가입 완료 추적
- **동작조건**: 추천 코드로 회원가입 완료 시 (서버)
- **메타데이터**: `invite_code`, `inviter_id`, `invited_user_id`

### `Referral_Reward_Granted`
- **목적**: 추천 리워드 지급 추적
- **동작조건**: 추천 리워드 지급 시 (서버)
- **메타데이터**: `invite_code`, `referrer_id`

### `Invite_Link_Clicked`
- **목적**: 초대 링크 클릭 추적
- **동작조건**: 딥링크로 앱 진입 시
- **메타데이터**: `invite_code`, `inviter_id`, `referrer`, `device_type`, `click_id`

### `Invite_Conversion_Completed`
- **목적**: 초대 전환 완료 추적
- **동작조건**: 초대 링크 클릭 후 회원가입 완료 시
- **메타데이터**: `invite_code`, `inviter_id`, `invited_user_id`, `signup_method`

---

## 11. 세션/앱 사용 이벤트 (7개)

### `Session_Started`
- **목적**: 앱 세션 시작 추적
- **동작조건**: 앱 실행 시
- **메타데이터**: `session_start_reason`, `app_version`

### `Session_Ended`
- **목적**: 앱 세션 종료 추적
- **동작조건**: 앱 종료 시
- **메타데이터**: `session_duration`

### `Push_Notification_Opened`
- **목적**: 푸시 알림 클릭 추적
- **동작조건**: 푸시 알림 클릭으로 앱 진입 시
- **메타데이터**: `notification_type`

### `First_Session_Completed`
- **목적**: 첫 세션 완료 추적
- **동작조건**: 첫 앱 실행 세션 종료 시
- **메타데이터**: `session_duration`

### `App_Opened`
- **목적**: 앱 열기 추적
- **동작조건**: 앱 포그라운드 전환 시
- **메타데이터**: `source`

### `App_Backgrounded`
- **목적**: 앱 백그라운드 전환 추적
- **동작조건**: 앱 백그라운드 전환 시
- **메타데이터**: `source`

### `Feature_Used`
- **목적**: 기능 사용 추적
- **동작조건**: 특정 기능 사용 시
- **메타데이터**: `feature_name`, `feature_category`, `usage_duration`

---

## 12. 썸메이트(AI 채팅) 이벤트 (12개)

### `Somemate_Session_Started`
- **목적**: AI 채팅 세션 시작 추적
- **동작조건**: 썸메이트 화면 진입 시
- **메타데이터**: `session_id`, `category`

### `Somemate_Session_Completed`
- **목적**: AI 채팅 세션 완료 추적
- **동작조건**: AI 세션 정상 종료 시
- **메타데이터**: `session_id`, `turn_count`

### `Somemate_Message_Sent`
- **목적**: AI에게 메시지 전송 추적
- **동작조건**: 사용자 메시지 전송 시
- **메타데이터**: `session_id`, `message_type`, `message_length`

### `Somemate_Message_Received`
- **목적**: AI 응답 수신 추적
- **동작조건**: AI 응답 수신 시
- **메타데이터**: `session_id`, `message_type`, `response_time`

### `Somemate_Analysis_Started`
- **목적**: AI 분석 시작 추적
- **동작조건**: AI 분석 요청 시
- **메타데이터**: `session_id`, `category`

### `Somemate_Analysis_Completed`
- **목적**: AI 분석 완료 추적
- **동작조건**: AI 분석 결과 수신 시
- **메타데이터**: `session_id`, `analysis_duration`

### `Somemate_Report_Viewed`
- **목적**: AI 리포트 조회 추적
- **동작조건**: AI 리포트 화면 진입 시
- **메타데이터**: `report_id`, `report_category`

### `Somemate_Report_Shared`
- **목적**: AI 리포트 공유 추적
- **동작조건**: AI 리포트 공유 버튼 클릭 시
- **메타데이터**: `report_id`, `share_platform`

### `Somemate_Category_Selected`
- **목적**: AI 카테고리 선택 추적
- **동작조건**: 카테고리(일상/인간관계/진로학교/연애) 선택 시
- **메타데이터**: `category`

### `Somemate_Session_Abandoned`
- **목적**: AI 세션 이탈 추적
- **동작조건**: AI 세션 중간 이탈 시
- **메타데이터**: `session_id`, `turn_count`

### `Somemate_Feedback_Submitted`
- **목적**: AI 피드백 제출 추적
- **동작조건**: AI 응답에 대한 피드백 제출 시
- **메타데이터**: `session_id`, `satisfaction_score`

### `Somemate_Follow_Up_Question`
- **목적**: AI 후속 질문 추적
- **동작조건**: AI 후속 질문 선택 시
- **메타데이터**: `session_id`, `question_type`

---

## 13. 리텐션 이벤트 (7개)

### `Day_1_Retention`
- **목적**: 1일차 리텐션 추적
- **동작조건**: 가입 후 1일째 앱 접속 시 (서버 배치)
- **메타데이터**: `days_since_signup`, `first_match_achieved`, `first_message_sent`, `profile_completion_rate`

### `Day_3_Retention`
- **목적**: 3일차 리텐션 추적
- **동작조건**: 가입 후 3일째 앱 접속 시 (서버 배치)
- **메타데이터**: `days_since_signup`, `first_match_achieved`, `first_message_sent`

### `Day_7_Retention`
- **목적**: 7일차 리텐션 추적
- **동작조건**: 가입 후 7일째 앱 접속 시 (서버 배치)
- **메타데이터**: `days_since_signup`, `matches_count`, `messages_sent`

### `Day_30_Retention`
- **목적**: 30일차 리텐션 추적
- **동작조건**: 가입 후 30일째 앱 접속 시 (서버 배치)
- **메타데이터**: `days_since_signup`, `matches_count`, `has_purchased`

### `Reactivation`
- **목적**: 재활성화 추적
- **동작조건**: 휴면 사용자 복귀 시
- **메타데이터**: `days_since_last_active`

### `Feature_Adopted`
- **목적**: 기능 채택 추적
- **동작조건**: 신규 기능 첫 사용 시
- **메타데이터**: `feature_name`

### `Account_Reactivated`
- **목적**: 계정 재활성화 추적
- **동작조건**: 탈퇴 취소 또는 계정 복구 시 (서버)
- **메타데이터**: `source`

---

## 14. 프로필 이벤트 (2개)

### `Profile_Completion_Updated`
- **목적**: 프로필 완성도 갱신 추적
- **동작조건**: 프로필 편집 완료 시
- **메타데이터**: `profile_completion_rate`

### `Profile_Photo_Uploaded`
- **목적**: 프로필 사진 업로드 추적
- **동작조건**: 프로필 사진 업로드 완료 시
- **메타데이터**: `image_count`

---

## 15. 인앱 리뷰 이벤트 (4개)

### `InAppReview_Eligible`
- **목적**: 리뷰 자격 충족 추적
- **동작조건**: 인앱 리뷰 조건 충족 시
- **메타데이터**: `source`

### `InAppReview_PrePromptShown`
- **목적**: 리뷰 사전 프롬프트 표시 추적
- **동작조건**: 리뷰 요청 전 모달 표시 시
- **메타데이터**: `source`

### `InAppReview_PrePromptResponse`
- **목적**: 리뷰 사전 프롬프트 응답 추적
- **동작조건**: 리뷰 모달에서 선택 시
- **메타데이터**: `response`

### `InAppReview_Requested`
- **목적**: 스토어 리뷰 요청 추적
- **동작조건**: 스토어 리뷰 API 호출 시
- **메타데이터**: `source`

---

## 16. 기타 이벤트 (6개)

### `Interest_Hold`
- **목적**: 관심사 보류 추적
- **동작조건**: 관심사 선택 화면에서 보류 시
- **메타데이터**: `source`

### `Interest_Started`
- **목적**: 관심사 선택 시작 추적
- **동작조건**: 관심사 선택 화면 진입 시
- **메타데이터**: `source`

### `Profile_Started`
- **목적**: 프로필 입력 시작 추적
- **동작조건**: 프로필 입력 화면 진입 시
- **메타데이터**: `source`

### `Miho_Message_Shown`
- **목적**: 미호 멘트 표시 추적
- **동작조건**: 미호 캐릭터 멘트 표시 시
- **메타데이터**: `message_type`

### `image_upload`
- **목적**: 이미지 업로드 추적
- **동작조건**: 이미지 업로드 시
- **메타데이터**: `source`

### `User_Metrics_Updated`
- **목적**: 사용자 지표 갱신 추적
- **동작조건**: 사용자 지표 갱신 시 (서버 배치)
- **메타데이터**: `source`

---

## 17. 사용자 관리 이벤트 (4개)

### `User_Blocked`
- **목적**: 사용자 차단 추적
- **동작조건**: 사용자 차단 시
- **메타데이터**: `blocked_user_id`, `reason`, `action_source`

### `User_Reported`
- **목적**: 사용자 신고 추적
- **동작조건**: 사용자 신고 시
- **메타데이터**: `reported_user_id`, `reason`, `action_source`

### `Account_Deletion_Cancelled`
- **목적**: 계정 삭제 취소 추적
- **동작조건**: 탈퇴 요청 취소 시
- **메타데이터**: `days_since_signup`

### `Account_Deleted`
- **목적**: 계정 삭제 완료 추적
- **동작조건**: 계정 완전 삭제 시
- **메타데이터**: `deletion_reason`, `days_since_signup`, `total_matches_count`, `has_purchased`

---

## 18. 앱 설치 유도 이벤트 (3개)

### `App_Install_Prompt_Shown`
- **목적**: 앱 설치 유도 배너 표시 추적
- **동작조건**: 웹에서 앱 설치 유도 배너 표시 시
- **메타데이터**: `source`

### `App_Install_Prompt_Install_Clicked`
- **목적**: 앱 설치 버튼 클릭 추적
- **동작조건**: 앱 설치 버튼 클릭 시
- **메타데이터**: `source`

### `App_Install_Prompt_Dismissed`
- **목적**: 앱 설치 유도 배너 닫기 추적
- **동작조건**: 앱 설치 유도 배너 닫기 시
- **메타데이터**: `source`

---

## 19. 서버 전용 매칭 파이프라인 이벤트 (7개)

### `Matching_Execution_Completed`
- **목적**: 매칭 실행 완료 추적
- **동작조건**: 매칭 알고리즘 실행 완료 시 (백엔드)
- **메타데이터**: `country`, `user_id`, `matched_user_id`, `matching_type`, `similarity_score`, `matching_duration_ms`, `initial_candidates`, `final_candidates`, `is_success`

### `Matching_Pipeline_Step`
- **목적**: 매칭 파이프라인 단계별 추적
- **동작조건**: 매칭 파이프라인 각 단계 완료 시 (백엔드)
- **메타데이터**: `step`, `step_name`, `candidates_before`, `candidates_after`, `candidates_filtered`, `filter_rate`, `duration_ms`

### `Vector_Search_Executed`
- **목적**: 벡터 검색 실행 추적
- **동작조건**: Qdrant 벡터 검색 실행 시 (백엔드)
- **메타데이터**: `collection`, `search_limit`, `score_threshold`, `results_count`, `search_time_ms`, `similarity_stats`

### `Filter_Relaxation_Step`
- **목적**: 필터 완화 단계 추적
- **동작조건**: 매칭 필터 완화 시 (백엔드)
- **메타데이터**: `relaxation_mode`, `region_level`, `applied_filters`, `relaxed_filters`, `candidates_found`, `is_success`

### `Bidirectional_Filter_Executed`
- **목적**: 양방향 필터 실행 추적
- **동작조건**: 양방향 필터링 실행 시 (백엔드)
- **메타데이터**: `filters_enabled`, `candidates_before`, `candidates_after`, `eliminated_by`, `filter_duration_ms`

### `Matching_Pool_Snapshot`
- **목적**: 매칭 풀 스냅샷 추적
- **동작조건**: 매칭 풀 상태 스냅샷 시 (백엔드 배치)
- **메타데이터**: `country`, `total_users_in_qdrant`, `male_users`, `female_users`, `gender_ratio`, `users_by_region`, `pool_health_score`

### `Matching_Failure_Analyzed`
- **목적**: 매칭 실패 분석 추적
- **동작조건**: 매칭 실패 시 원인 분석 (백엔드)
- **메타데이터**: `failure_stage`, `user_profile`, `filters_enabled`, `vector_search_attempts`, `max_relaxation_level_reached`, `suggested_actions`, `can_retry`

---

## 요약 테이블

| 카테고리 | 이벤트 수 |
|---------|----------|
| 회원가입/인증 | 27개 |
| 매칭 | 21개 |
| 온보딩 | 5개 |
| 좋아요 | 11개 |
| 채팅 | 14개 |
| 커뮤니티 | 16개 |
| 결제/수익 | 24개 |
| 구독 | 3개 |
| 모먼트 | 4개 |
| 추천/초대 | 6개 |
| 세션/앱 사용 | 7개 |
| 썸메이트(AI) | 12개 |
| 리텐션 | 7개 |
| 프로필 | 2개 |
| 인앱 리뷰 | 4개 |
| 기타 | 6개 |
| 사용자 관리 | 4개 |
| 앱 설치 유도 | 3개 |
| 서버 매칭 파이프라인 | 7개 |
| **총계** | **153개** |

---

## 관련 문서

- [mixpanel-events.ts](/src/shared/constants/mixpanel-events.ts) - 이벤트 상수 정의
- [mixpanel-tracking.ts](/src/shared/libs/mixpanel-tracking.ts) - 트래킹 유틸리티
- [use-mixpanel.ts](/src/shared/hooks/use-mixpanel.ts) - Mixpanel 훅
- [mixpanel-events-full-list.md](/docs/mixpanel-events-full-list.md) - 구현 현황 및 가이드
