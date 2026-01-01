# 서버 구현 이벤트 - 클라이언트 중복 제거 분석

**작성일**: 2025-12-29
**목적**: 서버 구현 내용과 중복되는 클라이언트 코드 제거

---

## 🔍 서버 현재 구현 현황 (전달받음)

### ✅ 이미 구현됨 (9개)

| # | 서버 이벤트 | 구현 위치 |
|---|-----------|----------|
| 1 | Matching_Execution_Completed | NestJS - MatchingAnalyticsService |
| 2 | Matching_Pipeline_Step | NestJS - MatchingAnalyticsService |
| 3 | Vector_Search_Executed | NestJS - ProfileSimilarFinderService |
| 4 | Filter_Relaxation_Step | NestJS - ProfileSimilarFinderService |
| 5 | Bidirectional_Filter_Executed | NestJS - BidirectionalFilter |
| 6 | Matching_Pool_Snapshot | NestJS - MatchingPoolSnapshotService (Cron) |
| 7 | Matching_Failure_Analyzed | NestJS - EnhancedMatchingService |
| 8 | **Invite Click** | 현재 로그만 (구현 예정) |
| 9 | **Invite Conversion** | 현재 로그만 (구현 예정) |

---

## 🚨 클라이언트 중복 검사 결과

### 1. Matching 파이프라인 (7개) - ✅ 중복 없음

| 서버 이벤트 | 클라이언트 존재 | 결과 |
|-----------|---------------|------|
| Matching_Execution_Completed | ❌ 없음 | ✅ 중복 없음 |
| Matching_Pipeline_Step | ❌ 없음 | ✅ 중복 없음 |
| Vector_Search_Executed | ❌ 없음 | ✅ 중복 없음 |
| Filter_Relaxation_Step | ❌ 없음 | ✅ 중복 없음 |
| Bidirectional_Filter_Executed | ❌ 없음 | ✅ 중복 없음 |
| Matching_Pool_Snapshot | ❌ 없음 | ✅ 중복 없음 |
| Matching_Failure_Analyzed | ❌ 없음 | ✅ 중복 없음 |

**결론**: 매칭 파이프라인 이벤트는 **100% 서버 전용**. 클라이언트 수정 불필요 ✅

---

### 2. 초대 이벤트 (2개) - 🚨 중복 발견!

#### 2.1 Invite_Link_Clicked - 🔴 중복!

**서버**:
- 현재 로그만 기록 중
- Mixpanel tracking 구현 예정이었음

**클라이언트**:
- ✅ 이미 구현됨!
- 파일: `src/features/invite/hooks/use-record-invite-click.ts:35`

```typescript
// 클라이언트 코드 (Line 35-41)
mixpanelAdapter.track(MIXPANEL_EVENTS.INVITE_LINK_CLICKED, {
  invite_code: variables.inviteCode,
  referrer: variables.referrer,
  device_type: getDeviceType(),
  click_id: data.clickId,
  timestamp: new Date().toISOString(),
});
```

**흐름**:
```
1. 사용자 초대 링크 클릭
2. 앱 실행 (Deep Link)
3. API 호출: POST /api/v1/invite/click
4. 서버: DB 기록 + clickId 반환
5. 클라이언트: API 성공 → Mixpanel tracking 🎯
```

##### ✅ 권장사항: 클라이언트 **유지**, 서버 **추가 안 함**

**이유**:
1. **클라이언트가 더 정확**: 실제 클릭 이벤트 감지
2. **서버는 API 호출만**: 중복됨
3. **현재 잘 작동 중**: 수정 불필요

**서버 코드 (현재 상태 유지)**:
```typescript
// ✅ 이대로 유지 (Mixpanel tracking 추가 안 함)
export async function recordInviteClick(req, res) {
  console.log('[Invite] Click recorded');

  const click = await InviteClick.create({
    inviteCode: req.body.inviteCode,
    deviceType: req.body.deviceType,
  });

  // ❌ Mixpanel tracking 안 함 (클라이언트에서 이미 함)
  res.json({ success: true, clickId: click.id });
}
```

##### 액션: 없음 (현재 상태 유지)

---

#### 2.2 Invite_Conversion_Completed - ✅ 중복 없음

**서버**:
- 현재 로그만 기록 중
- Mixpanel tracking 구현 예정

**클라이언트**:
- ❌ tracking 없음
- 타입 정의만 있음 (`InviteLinkEventProperties`)

##### ✅ 권장사항: 서버에서 **구현**

**이유**:
1. 회원가입 완료는 서버에서 확정
2. 초대 코드 검증도 서버
3. 리워드 지급도 서버

**서버 코드 (구현 필요)**:
```typescript
// ✅ 서버에서 구현
export async function signup(req, res) {
  const user = await createUser(req.body);

  if (req.body.inviteCode) {
    const invite = await validateInviteCode(req.body.inviteCode);

    // 🎯 초대 전환 완료 tracking (서버 전용)
    trackEvent('Invite_Conversion_Completed', user.id, {
      invite_code: req.body.inviteCode,
      inviter_id: invite.inviterId,
      signup_method: req.body.authMethod,
    });
  }
}
```

##### 액션: 서버 구현 (Phase 1에 추가됨)

---

### 3. 사용자 프로필 속성 (People API) - ✅ 역할 분리됨

**서버 구현** (전달받음):
```typescript
// 행동 지표 속성
mixpanel.people.set(userId, {
  $name: user.name,
  $email: user.email,
  total_matches: count,
  successful_matches: successCount,
  failed_matches: failCount,
  last_matching_at: timestamp,
  day_1_retention: true,
  day_3_retention: true,
  day_7_retention: true,
});
```

**클라이언트 구현** (확인됨):
**파일**: `src/features/auth/hooks/use-auth.tsx:213-221`

```typescript
// 프로필 정보 속성
mixpanelAdapter.setUserProperties({
  university_name: profileDetails.universityDetails?.name,
  university_verified: profileDetails.universityDetails?.isVerified,
  gender: my.gender,
  age: my.age,
  days_since_signup: Math.floor((Date.now() - new Date(my.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
});
```

#### ✅ 권장사항: 역할 분리 (양쪽 유지)

**이유**:
1. **중복 없음**: 서버 = 행동 지표, 클라이언트 = 프로필 정보
2. **목적 다름**: 서버 = 집계/통계, 클라이언트 = 기본 정보
3. **충돌 없음**: 다른 속성명 사용

#### 명확한 역할 분리

| 담당 | 속성 | 예시 |
|-----|------|------|
| **클라이언트** | 프로필 정보 | university_name, gender, age, university_verified |
| **서버** | 행동 지표 | total_matches, successful_matches, retention 플래그 |

##### 액션: 없음 (현재 상태 유지, 충돌 없음)

---

## 📊 최종 중복 분석 결과

### ✅ 중복 없음 (유지) - 8개

| 서버 이벤트 | 클라이언트 | 상태 |
|-----------|----------|------|
| Matching_Execution_Completed | ❌ 없음 | ✅ 유지 |
| Matching_Pipeline_Step | ❌ 없음 | ✅ 유지 |
| Vector_Search_Executed | ❌ 없음 | ✅ 유지 |
| Filter_Relaxation_Step | ❌ 없음 | ✅ 유지 |
| Bidirectional_Filter_Executed | ❌ 없음 | ✅ 유지 |
| Matching_Pool_Snapshot | ❌ 없음 | ✅ 유지 |
| Matching_Failure_Analyzed | ❌ 없음 | ✅ 유지 |
| Invite_Conversion_Completed | ❌ tracking 없음 | ✅ 서버 구현 |

### ✅ 역할 분리 (양쪽 유지) - 1개

| 서버/클라이언트 | 내용 | 중복 |
|---------------|------|------|
| **Invite_Link_Clicked** | 클라이언트: tracking ✅<br>서버: 로그만 ✅ | ✅ 충돌 없음 |
| **People API** | 클라이언트: 프로필 정보 ✅<br>서버: 행동 지표 ✅ | ✅ 충돌 없음 |

---

## 🎯 최종 액션 플랜

### ✅ 클라이언트 (FE) - 수정 불필요!

**결론**: 모든 클라이언트 tracking은 **그대로 유지** ✅

| 파일 | 내용 | 액션 |
|------|------|------|
| use-record-invite-click.ts | INVITE_LINK_CLICKED tracking | ✅ 유지 |
| use-auth.tsx | People API (프로필 정보) | ✅ 유지 |

**이유**:
1. Invite_Link_Clicked - 클라이언트에서 tracking하는 게 맞음 (실제 클릭 감지)
2. People API - 역할 분리됨 (프로필 vs 행동 지표)

---

### ✅ 서버 (Backend) - 구현 진행

**구현할 것**:
1. ✅ Invite_Conversion_Completed - 회원가입 API
2. ✅ Payment_Completed - 결제 검증 API
3. ✅ Like_Received, Like_Match_Created, Matching_Success - 좋아요 API
4. ✅ Day_1/7/30_Retention - Cron Job
5. ✅ Chat_24h_Active - Cron Job (선택)
6. ✅ Subscription_Renewed - Webhook

**구현 안 할 것**:
- ❌ Invite_Link_Clicked - 클라이언트가 이미 함

**총 27개** 서버 이벤트 구현 (Phase 1: 8개, Phase 2: 9개, Phase 3: 9개)

---

## 📋 체크리스트

### ✅ 클라이언트 팀
- [x] 중복 분석 완료
- [x] 수정 불필요 확인
- [x] Invite_Link_Clicked 유지
- [x] People API 유지

### 🔄 백엔드 팀
- [ ] Invite_Link_Clicked는 Mixpanel tracking 안 함 (로그만)
- [ ] Invite_Conversion_Completed 구현 (Phase 1)
- [ ] People API는 행동 지표만 사용
- [ ] 나머지 27개 이벤트 구현

---

## 💡 핵심 인사이트

### 완벽한 분리 달성 ✅

**클라이언트 역할**:
- 사용자 직접 액션 tracking (클릭, 입력, 화면 이동)
- 프로필 정보 People API (university, gender, age)
- Invite_Link_Clicked tracking (실제 클릭 이벤트)

**서버 역할**:
- 상대방 액션 tracking (Like_Received, First_Message_Received)
- 양방향 확인 (Like_Match_Created, Matching_Success)
- 시간 집계 (Day_1/7/30_Retention, Chat_24h_Active)
- 행동 지표 People API (total_matches, retention 플래그)
- Invite_Conversion_Completed tracking (회원가입 확정)

---

**결론**: 클라이언트는 수정 불필요! 서버만 27개 이벤트 구현하면 됩니다! ✅
