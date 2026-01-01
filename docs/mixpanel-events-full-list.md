# Mixpanel 전체 이벤트 목록 및 구현 가이드

**총 이벤트 수**: 153개
**최종 업데이트**: 2025-12-29

---

## 📊 구현 현황 요약

| 카테고리 | 총 개수 | 클라이언트 구현 | 서버 구현 필요 | 미구현 |
|---------|---------|----------------|---------------|--------|
| **회원가입/인증** | 27개 | 23개 ✅ | 4개 🔴 | - |
| **매칭** | 21개 | 18개 ✅ | 3개 🔴 | - |
| **좋아요** | 8개 | 6개 ✅ | 2개 🔴 | - |
| **채팅** | 10개 | 6개 ✅ | 4개 🔴 | - |
| **커뮤니티** | 16개 | 12개 ✅ | 4개 🔴 | - |
| **결제/수익** | 24개 | 18개 ✅ | 6개 🔴 | - |
| **모먼트** | 4개 | 4개 ✅ | - | - |
| **추천** | 6개 | 4개 ✅ | 2개 🔴 | - |
| **세션/앱** | 7개 | 7개 ✅ | - | - |
| **썸메이트(AI)** | 10개 | 10개 ✅ | - | - |
| **리텐션** | 11개 | 7개 ✅ | 4개 🔴 | - |
| **기타** | 9개 | 8개 ✅ | 1개 🔴 | - |
| **총계** | **153개** | **123개 (80%)** | **30개 (20%)** | **0개** |

---

## 🎯 범례

- ✅ **클라이언트** - 앱(React Native)에서 tracking
- 🔴 **서버** - 백엔드 API에서 tracking 필요
- 🟢 **구현완료** - 이미 코드에 구현됨
- 🟡 **미구현** - 이벤트만 정의됨, 코드 작성 필요

---

## 1. 회원가입/인증 (27개)

### ✅ 클라이언트에서 Tracking (23개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Signup_Login_View` | 로그인 화면 진입 | 🟢 | 회원가입 화면 |
| `Signup_Auth_Started` | 인증 시작 | 🟢 | 인증 버튼 클릭 |
| `Signup_University_View` | 대학 선택 화면 | 🟢 | 대학 인증 |
| `Signup_Details_View` | 상세정보 입력 화면 | 🟢 | 프로필 입력 |
| `Signup_Profile_View` | 프로필 사진 화면 | 🟢 | 사진 업로드 |
| `Signup_Init` | 회원가입 초기화 | 🟢 | 회원가입 시작 |
| `Signup_Route_Entered` | 회원가입 라우트 진입 | 🟢 | 라우팅 |
| `Signup_university` | 대학 선택 완료 | 🟢 | 대학 선택 |
| `Singup_university_details` | 대학 상세 입력 | 🟢 | 학과/학년 |
| `Signup_instagram_entered` | 인스타그램 입력 | 🟢 | SNS 연동 |
| `Signup_profile_image` | 프로필 사진 업로드 | 🟢 | 사진 업로드 |
| `Signup_profile_image_error` | 사진 업로드 오류 | 🟢 | 오류 발생 |
| `Signup_profile_invite_code_error` | 초대코드 오류 | 🟢 | 초대코드 입력 |
| `Signup_AgeCheck_Failed` | 나이 체크 실패 | 🟢 | 나이 인증 |
| `Signup_PhoneBlacklist_Failed` | 블랙리스트 전화번호 | 🟢 | 전화번호 인증 |
| `Signup_Error` | 회원가입 오류 | 🟢 | 오류 발생 |
| `Signup_Started` | 회원가입 시작 | 🟢 | 회원가입 시작 |
| `Signup_Profile_Image_Uploaded` | 프로필 사진 업로드 완료 | 🟢 | 사진 업로드 |
| `Signup_Interest_Selected` | 관심사 선택 | 🟢 | 관심사 입력 |
| `Auth_Login_Started` | 로그인 시작 | 🟢 | 로그인 버튼 클릭 |
| `Auth_Login_Completed` | 로그인 완료 | 🟢 | 로그인 성공 |
| `Auth_Login_Failed` | 로그인 실패 | 🟢 | 로그인 실패 |
| `Auth_Logout` | 로그아웃 | 🟢 | 로그아웃 버튼 |

### 🔴 서버에서 Tracking 필요 (4개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `Signup_done` / `signup_complete` | 회원가입 완료 | 최종 검증 후 확정 | POST `/api/v1/auth/signup` |
| `University_Verification_Started` | 대학 인증 시작 | 인증 프로세스 서버 관리 | POST `/api/v1/verification/start` |
| `University_Verification_Completed` | 대학 인증 완료 | 인증 결과 확정 | POST `/api/v1/verification/complete` |
| `Account_Reactivated` | 계정 재활성화 | 서버에서 계정 상태 변경 | POST `/api/v1/account/reactivate` |

---

## 2. 매칭 (21개)

### ✅ 클라이언트에서 Tracking (18개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Matching_Started` | 매칭 시작 | 🟢 | 매칭 버튼 클릭 |
| `Matching_Profile_Viewed` | 프로필 조회 | 🟢 | 프로필 카드 표시 |
| `Matching_Requested` | 매칭 요청 | 🟢 | 매칭 요청 버튼 |
| `Matching_Failed` | 매칭 실패 | 🟢 | 매칭 실패 응답 |
| `Profile_Viewed` | 프로필 상세 조회 | 🟢 | 프로필 상세 화면 |
| `Filter_Applied` | 필터 적용 | 🟢 | 필터 설정 |
| `Expand_Region_Empty_Viewed` | 지역 확장 Empty State | 🟢 | 매칭 대기 |
| `Expand_Region_Empty_Action` | 지역 확장 액션 | 🟢 | 대기/해제 선택 |
| `Match_Card_Viewed` | 매칭 카드 조회 | 🟢 | 매칭 결과 표시 |
| `Matching_Queue_Joined` | 대기열 진입 | 🟢 | use-external-matching.tsx:75 |
| `Matching_Queue_Time` | 대기 시간 측정 | 🟢 | use-external-matching.tsx:113 |
| `Matching_Queue_Abandoned` | 대기 포기 | 🟢 | use-external-matching.tsx:99 |
| `Profile_Completion_Updated` | 프로필 완성도 갱신 | 🟢 | 프로필 편집 |
| `Profile_Photo_Uploaded` | 프로필 사진 업로드 | 🟢 | 사진 업로드 |
| `Onboarding_Started` | 온보딩 시작 | 🟢 | 온보딩 화면 |
| `Onboarding_Completed` | 온보딩 완료 | 🟢 | 온보딩 완료 |
| `Onboarding_Step_Completed` | 온보딩 단계 완료 | 🟢 | 각 단계 완료 |
| `First_Match_Achieved` | 첫 매칭 성공 | 🟡 | 매칭 성공 시 |

### 🔴 서버에서 Tracking 필요 (3개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `Matching_Success` | 매칭 성공 | 매칭 알고리즘 서버 실행 | POST `/api/v1/matching/create` |
| `Match_Request_Sent` | 매칭 요청 전송 | 실제 요청 처리 확인 | POST `/api/v1/matching/request` |
| `Match_Accepted` / `Match_Rejected` | 매칭 수락/거절 | 상대방 액션이므로 서버 확인 | PUT `/api/v1/matching/:id/respond` |

---

## 3. 좋아요 (8개)

### ✅ 클라이언트에서 Tracking (6개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Like_Sent` | 좋아요 전송 | 🟢 | use-like.tsx:24 |
| `Like_List_Viewed` | 좋아요 목록 조회 | 🟢 | 좋아요 화면 |
| `Like_Rejected` | 좋아요 거절 | 🟢 | 거절 버튼 |
| `Like_Cancelled` | 좋아요 취소 | 🟢 | 취소 버튼 |
| `Like_Limit_Reached` | 좋아요 한도 도달 | 🟢 | use-like.tsx:146 |
| `First_Like_Sent` | 첫 좋아요 전송 | 🟢 | use-like.tsx:78 |

### 🔴 서버에서 Tracking 필요 (2개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `Like_Received` | 좋아요 수신 | 상대방이 보낸 좋아요 | POST `/api/v1/likes` (응답 후) |
| `Like_Match_Created` / `Like_Mutual_Match` | 상호 좋아요 매칭 | 양방향 매칭 확인 | POST `/api/v1/likes` (매칭 성사 시) |

---

## 4. 채팅 (10개)

### ✅ 클라이언트에서 Tracking (6개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Chat_Started` | 채팅 시작 | 🟢 | 채팅방 진입 |
| `Chat_Message_Sent` | 메시지 전송 | 🟢 | 메시지 전송 |
| `Chat_Ended` | 채팅 종료 | 🟢 | 채팅방 나가기 |
| `Chat_Gift_Sent` | 선물 전송 | 🟢 | 선물 전송 |
| `First_Message_Sent` | 첫 메시지 전송 | 🟡 | 메시지 전송 시 |
| `Chat_First_Response_Time` | 첫 응답 시간 | 🟡 | 첫 메시지 응답 |

### 🔴 서버에서 Tracking 필요 (4개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `Chat_Response` | 채팅 응답 | 상대방 응답 감지 | WebSocket 이벤트 핸들러 |
| `Chat_24h_Active` | 24시간 활성 대화 | 시간 기반 계산 | 배치 작업 (Cron Job) |
| `First_Message_Received` | 첫 메시지 수신 | 상대방 메시지 수신 | WebSocket 이벤트 |
| `Match_Conversation_Rate` | 매칭 후 대화율 | 매칭 후 24시간 내 대화 여부 | 배치 작업 |

---

## 5. 커뮤니티 (16개)

### ✅ 클라이언트에서 Tracking (12개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Article_Created` | 게시글 작성 | 🟢 | 게시글 작성 |
| `Article_Liked` | 게시글 좋아요 | 🟢 | 좋아요 버튼 |
| `Article_Commented` | 댓글 작성 | 🟢 | 댓글 작성 |
| `Article_Shared` | 게시글 공유 | 🟢 | 공유 버튼 |
| `Article_Viewed` | 게시글 조회 | 🟢 | 게시글 상세 |
| `Article_Bookmarked` | 북마크 추가 | 🟢 | 북마크 버튼 |
| `Article_Reported` | 게시글 신고 | 🟢 | 신고 버튼 |
| `Community_Post_Created` | 포스트 작성 | 🟢 | 포스트 작성 |
| `Community_Post_Viewed` | 포스트 조회 | 🟢 | 포스트 상세 |
| `Community_Post_Liked` | 포스트 좋아요 | 🟢 | 좋아요 버튼 |
| `Community_Comment_Added` | 댓글 추가 | 🟢 | 댓글 작성 |
| `Community_Post_Shared` | 포스트 공유 | 🟢 | 공유 버튼 |

### 🔴 서버에서 Tracking 필요 (4개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `Community_Daily_Active_Users` | 일간 활성 사용자 | 서버 집계 필요 | 배치 작업 (Daily Cron) |
| `Community_Feed_Viewed` | 피드 조회 | 피드 알고리즘 서버 실행 | GET `/api/v1/community/feed` |
| `Community_Post_Reported` | 포스트 신고 | 신고 처리 확인 | POST `/api/v1/community/:id/report` |
| `Community_Post_Deleted` | 포스트 삭제 | 관리자 삭제 가능 | DELETE `/api/v1/community/:id` |

---

## 6. 결제/수익 (24개)

### ✅ 클라이언트에서 Tracking (18개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `GemStore_FirstSale_7/16/27` | 첫 구매 프로모션 | 🟢 | 프로모션 상품 |
| `GemStore_Payment_Success` | 결제 성공 | 🟢 | 결제 완료 |
| `Payment_Initiated` | 결제 시작 | 🟢 | 결제 화면 |
| `Payment_Failed` | 결제 실패 | 🟢 | 결제 실패 |
| `Payment_Cancelled` | 결제 취소 | 🟢 | 취소 버튼 |
| `Payment_Store_Viewed` | 상점 조회 | 🟢 | 젬 상점 진입 |
| `Payment_Item_Selected` | 상품 선택 | 🟢 | 상품 클릭 |
| `Payment_Gem_Used` | 젬 사용 | 🟢 | 젬 소비 |
| `Payment_Ticket_Used` | 티켓 사용 | 🟢 | 티켓 소비 |
| `Payment_Method_Added` | 결제수단 추가 | 🟢 | 카드 등록 |
| `Payment_Method_Removed` | 결제수단 삭제 | 🟢 | 카드 삭제 |
| `Payment_First_Purchase` | 첫 구매 | 🟢 | use-portone.tsx:121 |
| `Payment_Repeat_Purchase` | 재구매 | 🟢 | use-portone.tsx:130 |
| `Payment_Abandoned_Cart` | 결제 이탈 | 🟡 | 결제 화면 이탈 |
| `Gem_Balance_Low` | 젬 부족 | 🟡 | 젬 체크 시 |
| `Gem_Balance_Depleted` | 젬 0개 | 🟡 | 젬 0 감지 |
| `Gem_Purchase_Prompt_Shown` | 구매 유도 표시 | 🟡 | 모달 표시 |
| `Gem_Purchase_Prompt_Dismissed` | 구매 유도 닫기 | 🟡 | 모달 닫기 |

### 🔴 서버에서 Tracking 필요 (6개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `Payment_Completed` | 결제 완료 (검증) | PG사 콜백 검증 | POST `/api/v1/payment/verify` |
| `Rematch_Purchased` | 재매칭권 구매 | 실제 적용 확인 | POST `/api/v1/payment/rematch` |
| `Subscription_Started` | 구독 시작 | 구독 상태 변경 | POST `/api/v1/subscription/start` |
| `Subscription_Renewed` | 구독 갱신 | 자동 갱신 | 배치 작업 (Webhook) |
| `Subscription_Cancelled` | 구독 취소 | 구독 취소 처리 | DELETE `/api/v1/subscription` |
| `Revenue_Per_User` | 사용자당 수익 | 집계 계산 | 배치 작업 (Daily) |

---

## 7. 모먼트 (4개)

### ✅ 클라이언트에서 Tracking (4개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Moment_Question_Viewed` | 질문 조회 | 🟢 | 모먼트 화면 |
| `Moment_Answer_Submitted` | 답변 제출 | 🟢 | 답변 작성 |
| `Moment_Answer_Shared` | 답변 공유 | 🟢 | 공유 버튼 |
| `Moment_Other_Answers_Viewed` | 다른 답변 조회 | 🟢 | 답변 목록 |

---

## 8. 추천 (6개)

### ✅ 클라이언트에서 Tracking (4개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Referral_Invite_Sent` | 초대 전송 | 🟢 | 초대 버튼 |
| `Referral_Invite_Accepted` | 초대 수락 | 🟢 | 초대 링크 클릭 |
| `Invite_Link_Clicked` | 초대 링크 클릭 | 🟢 | 딥링크 진입 |
| `Invite_Conversion_Completed` | 초대 전환 완료 | 🟢 | 회원가입 완료 |

### 🔴 서버에서 Tracking 필요 (2개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `Referral_Signup_Completed` | 추천으로 가입 완료 | 추천 코드 검증 | POST `/api/v1/auth/signup` |
| `Referral_Reward_Granted` | 추천 리워드 지급 | 리워드 지급 확정 | POST `/api/v1/rewards/referral` |

---

## 9. 세션/앱 사용 (7개)

### ✅ 클라이언트에서 Tracking (7개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Session_Started` | 세션 시작 | 🟢 | 앱 실행 |
| `Session_Ended` | 세션 종료 | 🟢 | 앱 종료 |
| `Push_Notification_Opened` | 푸시 알림 클릭 | 🟢 | 알림 클릭 |
| `First_Session_Completed` | 첫 세션 완료 | 🟢 | 첫 앱 실행 |
| `App_Opened` | 앱 열기 | 🟢 | 앱 포그라운드 |
| `App_Backgrounded` | 앱 백그라운드 | 🟢 | 앱 백그라운드 |
| `Feature_Used` | 기능 사용 | 🟢 | 각 기능 사용 |

---

## 10. 썸메이트 AI 채팅 (10개)

### ✅ 클라이언트에서 Tracking (10개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Somemate_Session_Started` | AI 세션 시작 | 🟢 | AI 채팅 진입 |
| `Somemate_Session_Completed` | AI 세션 완료 | 🟢 | 세션 종료 |
| `Somemate_Message_Sent` | AI 메시지 전송 | 🟢 | 메시지 전송 |
| `Somemate_Message_Received` | AI 응답 수신 | 🟢 | AI 응답 |
| `Somemate_Analysis_Started` | AI 분석 시작 | 🟢 | 분석 요청 |
| `Somemate_Analysis_Completed` | AI 분석 완료 | 🟢 | 분석 결과 |
| `Somemate_Report_Viewed` | AI 리포트 조회 | 🟢 | 리포트 화면 |
| `Somemate_Report_Shared` | AI 리포트 공유 | 🟢 | 공유 버튼 |
| `Somemate_Category_Selected` | AI 카테고리 선택 | 🟢 | 카테고리 선택 |
| `Somemate_Session_Abandoned` | AI 세션 이탈 | 🟢 | 중간 이탈 |

---

## 11. 리텐션 (11개)

### ✅ 클라이언트에서 Tracking (7개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Reactivation` | 재활성화 | 🟢 | 휴면 복귀 |
| `Feature_Adopted` | 기능 채택 | 🟢 | 신기능 사용 |
| `First_Match_Achieved` | 첫 매칭 달성 | 🟡 | 첫 매칭 |
| `First_Message_Sent` | 첫 메시지 전송 | 🟡 | 첫 메시지 |
| `First_Message_Received` | 첫 메시지 수신 | 🟡 | 상대 메시지 |
| `First_Like_Sent` | 첫 좋아요 전송 | 🟢 | use-like.tsx:78 |
| `First_Like_Received` | 첫 좋아요 수신 | 🟡 | 상대 좋아요 |

### 🔴 서버에서 Tracking 필요 (4개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `Day_1_Retention` | 1일차 리텐션 | 가입일 기준 계산 | 배치 작업 (Daily) |
| `Day_3_Retention` | 3일차 리텐션 | 가입일 기준 계산 | 배치 작업 (Daily) |
| `Day_7_Retention` | 7일차 리텐션 | 가입일 기준 계산 | 배치 작업 (Daily) |
| `Day_30_Retention` | 30일차 리텐션 | 가입일 기준 계산 | 배치 작업 (Daily) |

---

## 12. 기타 (9개)

### ✅ 클라이언트에서 Tracking (8개)

| 이벤트명 | 설명 | 구현상태 | 발생 위치 |
|---------|-----|---------|----------|
| `Interest_Hold` | 관심사 보류 | 🟢 | 관심사 화면 |
| `Interest_Started` | 관심사 시작 | 🟢 | 관심사 선택 |
| `Profile_Started` | 프로필 시작 | 🟢 | 프로필 입력 |
| `InAppReview_Eligible` | 리뷰 자격 | 🟢 | 리뷰 조건 충족 |
| `InAppReview_PrePromptShown` | 리뷰 프롬프트 표시 | 🟢 | 리뷰 모달 |
| `InAppReview_PrePromptResponse` | 리뷰 응답 | 🟢 | 리뷰 선택 |
| `InAppReview_Requested` | 리뷰 요청 | 🟢 | 스토어 리뷰 |
| `App_Install_Prompt_Shown` | 앱 설치 유도 | 🟢 | 웹→앱 전환 |

### 🔴 서버에서 Tracking 필요 (1개)

| 이벤트명 | 설명 | 이유 | 구현위치 |
|---------|-----|-----|---------|
| `User_Metrics_Updated` | 사용자 지표 갱신 | 서버 집계 필요 | 배치 작업 (Hourly) |

---

## 📋 서버 구현이 필요한 이벤트 상세 (30개)

### 🔴 높은 우선순위 (즉시 구현 권장)

| 이벤트명 | API 엔드포인트 | 구현 방법 | 비즈니스 중요도 |
|---------|--------------|----------|---------------|
| `Payment_Completed` | `POST /api/v1/payment/verify` | PG사 콜백 후 tracking | 🔥 매우 높음 |
| `Subscription_Renewed` | Webhook 또는 Cron | 자동 갱신 시 tracking | 🔥 매우 높음 |
| `Like_Received` | `POST /api/v1/likes` | 좋아요 생성 후 tracking | 🔥 높음 |
| `Like_Match_Created` | `POST /api/v1/likes` | 상호 좋아요 시 tracking | 🔥 높음 |
| `Matching_Success` | `POST /api/v1/matching/create` | 매칭 성사 시 tracking | 🔥 높음 |
| `Chat_24h_Active` | Cron Job (Daily) | 24시간 내 대화 여부 | 🔥 높음 |
| `Day_1/7/30_Retention` | Cron Job (Daily) | 코호트별 리텐션 계산 | 🔥 높음 |

### 🟡 중간 우선순위 (2-4주 내)

| 이벤트명 | API 엔드포인트 | 구현 방법 |
|---------|--------------|----------|
| `Referral_Signup_Completed` | `POST /api/v1/auth/signup` | 추천 코드 검증 후 |
| `Referral_Reward_Granted` | `POST /api/v1/rewards/referral` | 리워드 지급 시 |
| `Match_Conversation_Rate` | Cron Job | 매칭 후 24시간 대화율 |
| `Community_Daily_Active_Users` | Cron Job | 일간 DAU 계산 |
| `Revenue_Per_User` | Cron Job | 사용자당 수익 집계 |

### 🟢 낮은 우선순위 (장기)

| 이벤트명 | API 엔드포인트 | 구현 방법 |
|---------|--------------|----------|
| `University_Verification_Started/Completed` | 인증 API | 인증 시작/완료 시 |
| `Account_Reactivated` | `POST /api/v1/account/reactivate` | 계정 재활성화 시 |
| `User_Metrics_Updated` | Cron Job | 사용자 지표 갱신 |

---

## 💡 서버 구현 가이드

### 1. API 핸들러에서 Tracking

```typescript
// Node.js + TypeScript 예시
import mixpanel from 'mixpanel';

const mixpanelClient = mixpanel.init('YOUR_TOKEN');

// POST /api/v1/payment/verify
export async function verifyPayment(req, res) {
  try {
    // 1. PG사 검증
    const verified = await verifyPGCallback(req.body);

    if (verified) {
      // 2. DB 업데이트
      await updatePaymentStatus(req.body.transactionId, 'completed');

      // 3. Mixpanel Tracking
      mixpanelClient.track('Payment_Completed', {
        distinct_id: req.user.id,
        transaction_id: req.body.transactionId,
        amount: req.body.amount,
        payment_method: req.body.method,
        is_first_purchase: await checkIsFirstPurchase(req.user.id),
      });

      res.json({ success: true });
    }
  } catch (error) {
    // 에러 처리
  }
}
```

### 2. 배치 작업 (Cron Job)

```typescript
// Cron Job: 매일 오전 3시 실행
import cron from 'node-cron';

cron.schedule('0 3 * * *', async () => {
  console.log('Running daily retention tracking...');

  const usersToCheck = await getUsersForRetentionCheck();

  for (const user of usersToCheck) {
    const daysSinceSignup = calculateDaysSinceSignup(user.signupDate);

    if (daysSinceSignup === 1) {
      mixpanelClient.track('Day_1_Retention', {
        distinct_id: user.id,
        days_since_signup: 1,
        first_match_achieved: user.hasMatch,
        first_message_sent: user.hasSentMessage,
      });
    }

    // Day 3, 7, 30도 동일하게 처리
  }
});
```

### 3. WebSocket 이벤트

```typescript
// Socket.io 예시
io.on('connection', (socket) => {
  socket.on('message:sent', async (data) => {
    // 1. 메시지 저장
    await saveMessage(data);

    // 2. 상대방에게 전송
    socket.to(data.chatRoomId).emit('message:received', data);

    // 3. 상대방이 첫 메시지를 받았는지 확인
    const isFirstReceived = await checkIsFirstMessage(data.recipientId);

    if (isFirstReceived) {
      mixpanelClient.track('First_Message_Received', {
        distinct_id: data.recipientId,
        sender_id: data.senderId,
        chat_room_id: data.chatRoomId,
      });
    }
  });
});
```

---

## 🚀 구현 로드맵

### Phase 1: 핵심 서버 Tracking (1-2주)
- [ ] `Payment_Completed` - 결제 검증 API
- [ ] `Subscription_Renewed` - 구독 갱신 Webhook
- [ ] `Like_Received` / `Like_Match_Created` - 좋아요 API
- [ ] `Matching_Success` - 매칭 API

### Phase 2: 배치 작업 (2-3주)
- [ ] `Day_1/7/30_Retention` - 리텐션 Cron Job
- [ ] `Chat_24h_Active` - 채팅 활성도 Cron Job
- [ ] `Revenue_Per_User` - 수익 집계 Cron Job

### Phase 3: WebSocket 이벤트 (3-4주)
- [ ] `First_Message_Received` - 메시지 수신 이벤트
- [ ] `Chat_Response` - 채팅 응답 이벤트

### Phase 4: 기타 서버 이벤트 (4주+)
- [ ] 나머지 서버 이벤트 구현

---

## 📊 우선순위 매트릭스

| 카테고리 | 서버 구현 필요 | 비즈니스 중요도 | 구현 난이도 | 권장 순서 |
|---------|--------------|----------------|-----------|----------|
| **결제** | 6개 | 🔥🔥🔥 | 중간 | 1순위 |
| **리텐션** | 4개 | 🔥🔥🔥 | 낮음 | 2순위 |
| **매칭/좋아요** | 5개 | 🔥🔥 | 중간 | 3순위 |
| **채팅** | 4개 | 🔥🔥 | 높음 | 4순위 |
| **커뮤니티** | 4개 | 🔥 | 낮음 | 5순위 |
| **기타** | 7개 | 🔥 | 낮음 | 6순위 |

---

## 📞 다음 액션

### 백엔드 팀에 전달 사항
1. **서버 구현 필요 이벤트 30개** 리스트 공유
2. **Phase 1 핵심 이벤트 7개** 우선 구현 요청
3. **Mixpanel Server SDK** 설치 필요 (Node.js/Python/Java)
4. **API 응답에 매칭 성사 여부** 필드 추가 요청 (`isMatch: boolean`)

### 프론트엔드 팀 할 일
1. ✅ 클라이언트 tracking 123개 완료 (80%)
2. 🟡 미구현 클라이언트 이벤트 구현 (채팅, 리텐션 등)
3. 서버 이벤트 응답에 따른 추가 tracking

---

**작성일**: 2025-12-29
**총 이벤트**: 153개
**다음 리뷰**: 서버 구현 후
