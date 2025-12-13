# Mixpanel 대시보드 설정 가이드

## 🎯 Tier 1: Executive Dashboard

### 대시보드 생성
1. Mixpanel → **Boards** → **Create New Board**
2. 이름: `[Sometimes] North Star Metrics`
3. 설명: `일일 핵심 지표 모니터링 - 매일 오전 확인`

---

## 📈 지표 1: DAU (Daily Active Users)

### Insights 리포트 생성
1. **Insights** 클릭
2. 다음과 같이 설정:

```
Event: Session_Started
Counting: Unique (Unique users who did)
Segmented by: (None)
Time Range: Last 30 Days
Visualization: Line Chart
```

3. **Breakdown 추가 (선택사항)**:
   - Platform (iOS/Android)
   - Auth Method (Kakao/Apple/Email)

4. **Save** → `DAU - Daily Active Users`
5. **Add to Board** → `[Sometimes] North Star Metrics`

### 목표선 추가
1. 리포트 우측 상단 **⋮** → **Set Goal**
2. Goal Value: `2000`
3. Goal Line Color: Green

---

## 📊 지표 2: 매칭 성사율

### Funnels 리포트 생성
1. **Funnels** 클릭
2. 다음 단계 추가:

```
Step 1: Matching_Started
  └─ Filter: matching_type = "first_match" (무료 매칭만)

Step 2: Matching_Success
  └─ (필터 없음)

Conversion Window: 7 days
```

3. **Conversion Criteria**:
   - `Holding Constant: User ID`

4. **Visualization**:
   - Show as: Percentage
   - Time Granularity: Daily

5. **Save** → `매칭 성사율 - First Match`
6. **Add to Board**

### 목표 설정
- Baseline: 현재 전환율 확인
- Target: 35% (점진적 개선)

---

## 💝 지표 3: 상호 좋아요율

### Custom Formula (Insights)

#### Step 1: Match Request Sent 집계
1. **Insights** → New Report
2. 설정:
```
Event: Match_Request_Sent
Counting: Total (Count of events)
Time Range: Last 30 Days
```
3. Save as `A: Match Requests`

#### Step 2: Match Accepted 집계
1. **Insights** → New Report
2. 설정:
```
Event: Match_Accepted
Counting: Total (Count of events)
Time Range: Last 30 Days
```
3. Save as `B: Match Accepted`

#### Step 3: Formula 생성
1. **Insights** → New Report
2. **Custom Formula** 활성화
3. Formula 입력:
```
(B / A) * 100
```
4. 라벨: `상호 좋아요율 (%)`
5. Save → Add to Board

### 해석 가이드
- **15% 미만**: 매칭 품질 이슈 (알고리즘 개선 필요)
- **15~25%**: 정상 범위
- **25% 이상**: 매우 우수 (현상 유지 전략)

---

## 💬 지표 4: 채팅 오픈율

### Funnels 리포트
1. **Funnels** 클릭
2. 단계 설정:

```
Step 1: Match_Accepted
  └─ (필터 없음)

Step 2: Chat_Started
  └─ (필터 없음)

Conversion Window: 7 days
Holding Constant: User ID
```

3. **Visualization**:
   - Show as: Percentage + Count
   - Breakdown by: match_type (유료/무료 비교)

4. Save → `채팅 오픈율 (Mutual Like → Chat)`

### Alert 설정
1. 리포트 우측 상단 **⋮** → **Set Alert**
2. Condition: `Falls below 60%`
3. Notify: 팀 Slack 채널

---

## 💳 지표 5: 유료 전환율

### Custom Formula (Insights)

#### Step 1: DAU 집계
```
Event: Session_Started
Counting: Unique users
Time Range: Last 30 Days
```
Save as `A: DAU`

#### Step 2: 유료 사용자 수
```
Event: Payment_Completed
Counting: Unique users
Time Range: Last 30 Days
```
Save as `B: Paying Users`

#### Step 3: Formula
```
(B / A) * 100
```
라벨: `유료 전환율 (%)`

### Cohort 비교 (심화)
1. **User Properties** 추가:
   - `has_purchased` (boolean)
2. Segment by `has_purchased` 비교

---

## 🔁 지표 6: D1 Retention

### Retention 리포트 생성
1. **Retention** 클릭
2. 설정:

```
First Time: Signup_Completed
  └─ (사용자가 가입한 날)

Return Event: Session_Started
  └─ (사용자가 다시 앱을 연 날)

Measure retention over: 30 days
Show retention as: Percentage
```

3. **Visualization**:
   - Chart Type: Curve (트렌드 확인)
   - Cohort by: Week (주간 코호트 비교)

4. Save → `D1/D7/D30 Retention`

### 기대 수치
- **D1 (1일차)**: 40~50%
- **D7 (7일차)**: 20~30%
- **D30 (30일차)**: 10~15%

---

## 🎨 Dashboard 레이아웃 최적화

### 배치 순서 (중요도 기준)
```
┌─────────────────────────────────────┐
│  📱 DAU (대형 차트)                 │
├─────────────┬───────────────────────┤
│ 매칭 성사율  │  상호 좋아요율         │
├─────────────┼───────────────────────┤
│ 채팅 오픈율  │  유료 전환율           │
├─────────────┴───────────────────────┤
│  🔁 D1 Retention (대형 차트)        │
└─────────────────────────────────────┘
```

### Dashboard 설정
1. **Auto-refresh**: Enable (30분마다)
2. **Date Range**: Last 30 Days (기본값)
3. **Export Schedule**: 매주 월요일 오전 9시 → 팀 이메일

---

## 🎯 Tier 2: Growth Dashboard

### 대시보드 생성
이름: `[Sometimes] Growth Funnel`

### 포함 지표

#### 1. 전체 유저 퍼널 (Funnels)
```
Step 1: Signup_Started
Step 2: Signup_Completed
Step 3: Profile_Completion_Updated (completion_rate >= 80)
Step 4: Matching_Started
Step 5: Matching_Success
Step 6: Match_Request_Sent
Step 7: Match_Accepted
Step 8: Chat_Started

Conversion Window: 14 days
```

**병목 지점 파악**:
- 각 단계별 Drop-off 확인
- 50% 이상 이탈 구간 집중 개선

#### 2. 신규 가입자 트렌드 (Insights)
```
Event: Signup_Completed
Counting: Unique users
Segmented by:
  - referral_source (유입 경로)
  - university_name (대학별)
Time Range: Last 90 Days
Visualization: Stacked Bar Chart
```

#### 3. 프로필 완성도 분포 (Insights)
```
Event: Profile_Completion_Updated
Show property distribution: profile_completion_rate
Buckets: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
Time Range: Last 30 Days
```

**액션 아이템**:
- 60% 미만 사용자에게 Push 발송
- 완성도 높은 사용자 프로필 예시로 활용

#### 4. 매칭 대기 시간 (Insights)
```
Event: Matching_Success
Show property distribution: time_to_match
Buckets: 0-6h, 6-12h, 12-24h, 1-3d, 3d+
Visualization: Pie Chart
```

#### 5. 대학생 인증률 (Custom Formula)
```
A: Signup_Completed (unique users)
B: University_Verification_Completed (unique users)

Formula: (B / A) * 100
Target: 85% 이상
```

---

## 🛠️ Tier 3: Product Dashboard

### 대시보드 생성
이름: `[Sometimes] Feature Performance`

### 포함 지표

#### 1. 결제 퍼널 (Funnels)
```
Step 1: Payment_Store_Viewed
Step 2: Payment_Item_Selected (아이템 선택)
Step 3: Payment_Initiated (결제 시작)
Step 4: Payment_Completed (결제 완료)

Conversion Window: 1 hour
Breakdown by: payment_method
```

**최적화 포인트**:
- `Store → Item Selected`: 상품 매력도
- `Initiated → Completed`: 결제 프로세스 UX

#### 2. 채팅 참여도 (Insights)
```
Event: Chat_Ended
Average of: message_count
Segmented by: match_type (first/rematch)
Time Range: Last 30 Days
```

**건강한 채팅**:
- 평균 20건 이상 메시지
- 채팅 지속 시간 10분 이상

#### 3. 기능별 사용률 (Insights)
```
Events (비교):
  - Profile_Viewed (프로필 조회)
  - Match_Request_Sent (좋아요)
  - Chat_Message_Sent (메시지)
  - Payment_Store_Viewed (스토어 방문)

Counting: Total events
Visualization: Multi-line chart
```

#### 4. 이탈 분석 (Cohorts)

##### Cohort 생성
1. **Data Management** → **Cohorts** → **Create Cohort**

**Cohort 1: 활성 사용자**
```
Conditions:
  - Did event: Session_Started
  - In the last: 7 days
```

**Cohort 2: 휴면 사용자**
```
Conditions:
  - Did event: Session_Started
  - Between: 8 days ago and 30 days ago
  - Did NOT do: Session_Started
  - In the last: 7 days
```

**Cohort 3: 이탈 위험군**
```
Conditions:
  - Did event: Matching_Failed
  - At least: 3 times
  - In the last: 7 days
```

##### 활용 방법
- 각 Cohort별 행동 패턴 비교
- 타겟 마케팅 (Push, Email)
- A/B 테스트 대상 그룹

---

## 📊 추가 설정: Custom Properties

### User Properties 추가 필요

Mixpanel에서 User Profile에 다음 속성 추가:

```javascript
// 앱 내에서 설정
mixpanel.people.set({
  // 기본 정보
  'university_name': '서울대학교',
  'university_verified': true,
  'gender': 'FEMALE',
  'age': 25,

  // 매칭 관련
  'total_matches': 5,
  'successful_matches': 2,
  'mutual_likes_count': 3,

  // 결제 관련
  'has_purchased': true,
  'total_spent': 15000,
  'purchase_count': 2,
  'first_purchase_date': '2025-01-15',

  // 참여도
  'profile_completion_rate': 85,
  'days_since_signup': 45,
  'last_active_date': '2025-03-10',

  // 세그먼트
  'user_tier': 'active', // active/dormant/churned
  'engagement_score': 7.5 // 0~10
});
```

---

## 🚨 Alert 설정 권장사항

### Critical Alerts (즉시 대응)
1. **DAU 급감**: 전일 대비 20% 이상 하락
2. **매칭 성사율 급락**: 20% 미만
3. **결제 실패율 증가**: 10% 이상

### Warning Alerts (24시간 내 확인)
1. D1 Retention < 35%
2. 채팅 오픈율 < 60%
3. 유료 전환율 < 4%

### Alert 생성 방법
1. 리포트 우측 상단 **⋮** → **Set Alert**
2. Condition 설정
3. Notification: Slack/Email 연동

---

## 📅 주간 리뷰 체크리스트

### 매주 월요일 오전 10시

#### Executive Dashboard
- [ ] DAU 트렌드 확인 (전주 대비 증감)
- [ ] 핵심 전환율 3개 체크
- [ ] D1 Retention 변화 확인

#### Growth Dashboard
- [ ] 신규 가입자 유입 경로 분석
- [ ] 유저 퍼널 병목 구간 파악
- [ ] 주간 성장률 계산 (WoW)

#### Product Dashboard
- [ ] 신규 기능 사용률 확인
- [ ] 이탈 위험 코호트 크기 체크
- [ ] 채팅 품질 지표 검토

#### 액션 아이템 도출
- 개선이 필요한 지표 1~2개 선정
- 다음 주 실험 계획 수립
- 팀 공유 (Slack/Notion)

---

## 🎓 Mixpanel 고급 활용 팁

### 1. Segmentation으로 인사이트 발굴

**예시: 성공적인 매칭 패턴 분석**
```
Event: Matching_Success
Breakdown by:
  - profile_completion_rate (구간별)
  - university_verified (true/false)
  - time_of_day (오전/오후/저녁/심야)

→ "프로필 완성도 80% 이상 + 인증 완료 사용자"의 매칭 성사율이 2배 높음
```

### 2. Flows로 사용자 여정 시각화

```
Starting Event: Signup_Completed
Show next: 5 steps
Time Window: 7 days

→ 가입 후 사용자가 실제로 어떤 경로를 따라가는지 확인
→ 예상 밖의 이탈 지점 발견
```

### 3. A/B Testing with Experiments

Mixpanel Experiments 기능 활용:
1. 실험 그룹 생성 (50% vs 50%)
2. Feature Flag로 분기 처리
3. 결과 자동 집계 및 통계적 유의성 검증

---

## 📚 참고: 지표별 목표 수치 (업계 벤치마크)

| 지표 | Sometimes 현재 | 목표 (3개월) | 우수 (6개월) | 업계 평균 |
|------|---------------|-------------|-------------|----------|
| DAU | ~500 | 2,000 | 5,000 | - |
| D1 Retention | ? | 40% | 50% | 35~45% |
| D7 Retention | ? | 25% | 35% | 20~30% |
| 매칭 성사율 | ? | 35% | 45% | 30~40% |
| 상호 좋아요율 | ? | 20% | 25% | 15~20% |
| 채팅 오픈율 | ? | 70% | 80% | 60~70% |
| 유료 전환율 | ? | 6% | 10% | 4~8% |
| ARPPU | ? | ₩10,000 | ₩15,000 | - |

---

## 🔗 추가 자료

- [Mixpanel Academy](https://mixpanel.com/academy/)
- [Product Analytics Playbook](https://mixpanel.com/content/playbook/)
- Amplitude vs Mixpanel 비교: [링크]

---

## ✅ Setup Checklist

완료 여부를 체크하세요:

### Dashboard 생성
- [ ] Tier 1: Executive Dashboard 생성
- [ ] Tier 2: Growth Dashboard 생성
- [ ] Tier 3: Product Dashboard 생성

### 핵심 지표 설정
- [ ] DAU 리포트
- [ ] 매칭 성사율 Funnel
- [ ] 상호 좋아요율 Formula
- [ ] 채팅 오픈율 Funnel
- [ ] 유료 전환율 Formula
- [ ] D1/D7/D30 Retention

### Alert 설정
- [ ] DAU 급감 Alert
- [ ] 매칭 성사율 Alert
- [ ] 채팅 오픈율 Alert

### Cohort 생성
- [ ] 활성 사용자 Cohort
- [ ] 휴면 사용자 Cohort
- [ ] 이탈 위험군 Cohort
- [ ] 유료 사용자 Cohort

### 팀 설정
- [ ] Dashboard 주간 이메일 리포트 설정
- [ ] Slack 연동
- [ ] 팀원 접근 권한 부여

---

**작성일**: 2025-12-11
**업데이트**: 지표 목표치는 월간 리뷰 후 조정
