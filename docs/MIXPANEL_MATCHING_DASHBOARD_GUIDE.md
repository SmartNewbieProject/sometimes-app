# 매칭 대시보드 구축 가이드

> **프로젝트**: Sometimes App (Project ID: 3375891)
> **작성일**: 2024-12-24
> **목적**: 매칭 시스템의 전체 퍼널 및 전환율 모니터링

---

## 📋 목차

1. [대시보드 개요](#대시보드-개요)
2. [Step 1: 핵심 메트릭 생성](#step-1-핵심-메트릭-생성)
3. [Step 2: 매칭 퍼널 생성](#step-2-매칭-퍼널-생성)
4. [Step 3: 대시보드 구성](#step-3-대시보드-구성)
5. [Step 4: 알람 설정](#step-4-알람-설정)

---

## 대시보드 개요

### 매칭 플로우 맵

```
Matching_Success (알고리즘 매칭)
    ↓
Like_Sent (사용자가 좋아요 전송)
    ↓
Match_Accepted (상호 좋아요 성공)
    ↓
Chat_Started (채팅방 생성)
    ↓
Chat_24h_Active (24시간 내 활발한 대화)
```

### 핵심 KPI

| 지표 | 계산식 | 목표값 | Critical Level |
|------|--------|---------|----------------|
| **상호 좋아요율** | Match_Accepted / Like_Sent × 100 | 15-25% | < 10% |
| **채팅 활성화율** | Chat_24h_Active (mutual) / Chat_Started × 100 | 35%+ | < 25% |
| **매칭 성공률** | Matching_Success / (전체 매칭 시도) × 100 | 85%+ | < 70% |
| **채팅방 진입률** | Chat_Started / Match_Accepted × 100 | 90%+ | < 80% |

---

## Step 1: 핵심 메트릭 생성

### 1-1. 상호 좋아요율 (Critical KPI)

**목적**: 매칭 품질의 가장 중요한 지표

#### 생성 방법

1. **Mixpanel 접속**
   ```
   https://mixpanel.com/project/3375891
   ```

2. **Insights → Create New Report**
   - 왼쪽 메뉴에서 `Insights` 클릭
   - 우측 상단 `Create New Report` 버튼 클릭

3. **Report 설정**
   ```
   Chart Type: Number (숫자)

   Event A:
   - Event: Match_Accepted
   - Metric: Total (Count)

   + Add Event B:
   - Event: Like_Sent
   - Metric: Total (Count)

   Custom Formula:
   - Formula: (A / B) * 100
   - Name: 상호 좋아요율 (%)

   Time Range: Last 30 Days
   Compare to: Previous Period
   ```

4. **저장**
   - Name: `상호 좋아요율 (%)`
   - Description: `Match_Accepted / Like_Sent × 100. 목표: 15-25%`
   - Save to Dashboard: (나중에 추가)

#### 예상 결과

```
현재값: 18.5%
이전 기간: 16.2%
변화: +2.3%p ↑
```

---

### 1-2. 채팅 활성화율

**목적**: 매칭 후 실제 대화로 이어지는 비율 측정

#### 생성 방법

1. **Insights → Create New Report**

2. **Report 설정**
   ```
   Chart Type: Number

   Event A:
   - Event: Chat_24h_Active
   - Filters:
     * activity_status = 'mutual'
     * is_mutual_conversation = true
   - Metric: Total (Count)

   + Add Event B:
   - Event: Chat_Started
   - Metric: Total (Count)

   Custom Formula:
   - Formula: (A / B) * 100
   - Name: 채팅 활성화율 (%)

   Time Range: Last 30 Days
   ```

3. **저장**
   - Name: `채팅 활성화율 (%)`
   - Description: `24시간 내 상호 대화 비율. 목표: 35%+`

---

### 1-3. 일일 매칭 성공 건수

**목적**: 매칭 알고리즘 활동량 모니터링

#### 생성 방법

1. **Insights → Create New Report**

2. **Report 설정**
   ```
   Chart Type: Line

   Event:
   - Event: Matching_Success
   - Metric: Total (Count)

   Time Range: Last 30 Days
   Granularity: Day

   Breakdown:
   - None (전체 합계)

   Goal Line:
   - Value: 100 (하루 목표 매칭 수)
   ```

3. **저장**
   - Name: `일일 매칭 성공 건수`

---

### 1-4. 매칭 실패 원인 분석

**목적**: 실패 유형별 분포 파악 및 개선 포인트 도출

#### 생성 방법

1. **Insights → Create New Report**

2. **Report 설정**
   ```
   Chart Type: Pie Chart

   Event:
   - Event: Matching_Failed
   - Metric: Total (Count)

   Breakdown:
   - Property: failure_category

   Time Range: Last 30 Days
   ```

3. **예상 결과**
   ```
   PAYMENT (재매칭권/젬 부족): 45%
   PERMISSION (소통 제한): 22%
   USAGE (중복 좋아요): 18%
   SYSTEM (시스템 오류): 15%
   ```

4. **저장**
   - Name: `매칭 실패 원인 분포`

---

## Step 2: 매칭 퍼널 생성

### 2-1. 핵심 매칭 퍼널

**목적**: 전체 매칭 여정의 전환율 파악

#### 생성 방법

1. **Funnels → Create New Funnel**
   - 왼쪽 메뉴에서 `Funnels` 클릭
   - `Create New Funnel` 버튼 클릭

2. **Funnel Steps 설정**
   ```
   Step 1: Matching_Success
   - Filter: (없음)
   - Name: 알고리즘 매칭 성공

   Step 2: Like_Sent
   - Filter: (없음)
   - Name: 좋아요 전송

   Step 3: Match_Accepted
   - Filter: (없음)
   - Name: 상호 좋아요 (매칭 확정)

   Step 4: Chat_Started
   - Filter: (없음)
   - Name: 채팅방 생성

   Step 5: Chat_24h_Active
   - Filter: activity_status != 'inactive'
   - Name: 24시간 내 활성 대화
   ```

3. **Funnel 설정**
   ```
   Conversion Window: 14 days
   (매칭 성공부터 채팅 활성화까지 최대 2주)

   Counting Method: Unique Users

   Time Range: Last 30 Days
   ```

4. **예상 전환율**
   ```
   Matching_Success → Like_Sent: 75%
   Like_Sent → Match_Accepted: 18% ⚠️ Critical
   Match_Accepted → Chat_Started: 92%
   Chat_Started → Chat_24h_Active: 38%

   Overall Conversion:
   Matching_Success → Chat_24h_Active: 4.7%
   ```

5. **저장**
   - Name: `전체 매칭 퍼널`

---

### 2-2. 무료 vs 재매칭 비교 퍼널

**목적**: 재매칭권 ROI 검증

#### 생성 방법

1. **기존 퍼널 복제**
   - `전체 매칭 퍼널` → 우측 상단 `...` → `Duplicate`

2. **Breakdown 추가**
   ```
   Breakdown By:
   - Property: matching_type

   Values to Compare:
   - auto (무료 매칭)
   - rematch (재매칭)
   ```

3. **기대 인사이트**
   ```
   가설: 재매칭 사용자의 상호 좋아요율이 더 높을 것

   무료 매칭 (auto):
   - Like_Sent → Match_Accepted: 16%

   재매칭 (rematch):
   - Like_Sent → Match_Accepted: 24% ✅

   결론: 재매칭권 구매가 더 높은 품질의 매칭 제공
   → 프리미엄 가격 책정 정당화
   ```

4. **저장**
   - Name: `무료 vs 재매칭 퍼널 비교`

---

### 2-3. 빠른 채팅 전환 퍼널

**목적**: 매칭 후 빠르게 대화를 시작하는 사용자 비율

#### 생성 방법

1. **Funnels → Create New Funnel**

2. **Funnel Steps 설정**
   ```
   Step 1: Match_Accepted
   - Filter: (없음)

   Step 2: Chat_Started
   - Filter: (없음)
   - Time Constraint: Within 1 hour of Step 1

   Step 3: Chat_24h_Active
   - Filter: activity_status = 'mutual'
   ```

3. **Funnel 설정**
   ```
   Conversion Window: 48 hours
   Time Range: Last 30 Days
   ```

4. **Time Buckets 분석**
   ```
   Completed within 1 hour: 45%
   Completed within 6 hours: 72%
   Completed within 24 hours: 89%

   인사이트: 1시간 내 채팅 시작한 사용자의 활성화율이 높음
   → 매칭 후 즉시 푸시 알림 전송 필요
   ```

5. **저장**
   - Name: `빠른 채팅 전환율`

---

## Step 3: 대시보드 구성

### 3-1. 대시보드 생성

1. **Dashboards → Create New Dashboard**
   - 왼쪽 메뉴에서 `Dashboards` 클릭
   - `Create New Dashboard` 버튼 클릭

2. **기본 정보**
   ```
   Name: 매칭 시스템 모니터링
   Description: 매칭 퍼널, 전환율, 품질 지표 종합 대시보드
   Visibility: Team (팀 전체 공유)
   ```

---

### 3-2. 레이아웃 구성

#### Row 1: 핵심 KPI 카드 (4개)

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 상호 좋아요율 │  채팅 활성화율 │ 일일 매칭 성공 │ 매칭 성공률  │
│   18.5%     │    38.2%    │    142건    │   87.3%    │
│  +2.3%p ↑   │   -1.5%p ↓  │   +12 ↑    │   +0.8%p ↑ │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**설정 방법**:
1. `Add Widget` → `Insight`
2. 저장된 Insight 선택
3. Widget Size: Small (1/4 width)
4. 4개를 나란히 배치

---

#### Row 2: 전체 매칭 퍼널 (Full Width)

```
┌──────────────────────────────────────────────────────────┐
│         전체 매칭 퍼널 (무료 vs 재매칭 비교)               │
│                                                           │
│  Matching    Like_Sent   Match      Chat_      Chat_24h  │
│  _Success                Accepted   Started    _Active   │
│    1,000  →   750    →   135   →    124   →     47      │
│   (100%)    (75.0%)    (18.0%)   (91.9%)    (37.9%)     │
│                                                           │
│  ■ 무료 매칭 (auto)    ■ 재매칭 (rematch)                │
└──────────────────────────────────────────────────────────┘
```

**설정 방법**:
1. `Add Widget` → `Funnel`
2. 저장된 Funnel 선택: `무료 vs 재매칭 퍼널 비교`
3. Widget Size: Large (Full Width)

---

#### Row 3: 분석 차트 (2개 나란히)

```
┌─────────────────────────────┬─────────────────────────────┐
│   매칭 실패 원인 분포 (Pie)   │   일일 매칭 성공 추이 (Line)  │
│                             │                             │
│   PAYMENT      45%          │   150 ┤                     │
│   PERMISSION   22%          │   100 ┤     ╱╲  ╱╲         │
│   USAGE        18%          │    50 ┤  ╱╲╱  ╲╱  ╲        │
│   SYSTEM       15%          │     0 └─────────────────    │
└─────────────────────────────┴─────────────────────────────┘
```

**설정 방법**:
1. `Add Widget` → `Insight`
2. Widget Size: Medium (1/2 width)
3. 2개를 나란히 배치

---

#### Row 4: 시간대별 분석 (Line Chart)

```
┌──────────────────────────────────────────────────────────┐
│           시간대별 매칭 활동 (0-23시)                      │
│                                                           │
│  100 ┤                     ╱╲                            │
│   80 ┤                  ╱╲╱  ╲╱╲                         │
│   60 ┤               ╱╲╱          ╲                      │
│   40 ┤            ╱╲╱                ╲╱╲                 │
│   20 ┤         ╱╲╱                      ╲                │
│    0 └─────────────────────────────────────────          │
│       0  3  6  9  12 15 18 21 24                         │
│                                                           │
│  피크 시간대: 21-23시 (오후 9-11시)                        │
└──────────────────────────────────────────────────────────┘
```

**Insight 생성**:
```
Event: Matching_Success
Metric: Count
Breakdown: Hour of Day
Time Range: Last 7 Days
Chart Type: Line
```

---

### 3-3. 대시보드 최종 레이아웃

```
┌────────────────────────────────────────────────────────────┐
│  매칭 시스템 모니터링                    Last 30 Days      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ROW 1: KPI Cards                                          │
│  ┌──────┬──────┬──────┬──────┐                            │
│  │ 18.5%│ 38.2%│ 142건│ 87.3%│                            │
│  └──────┴──────┴──────┴──────┘                            │
│                                                            │
│  ROW 2: Main Funnel                                        │
│  ┌──────────────────────────────────────────────┐          │
│  │   전체 매칭 퍼널 (무료 vs 재매칭)             │          │
│  │   100% → 75% → 18% → 92% → 38%              │          │
│  └──────────────────────────────────────────────┘          │
│                                                            │
│  ROW 3: Analytics                                          │
│  ┌────────────────────┬────────────────────┐              │
│  │  실패 원인 분포     │  일일 매칭 추이     │              │
│  └────────────────────┴────────────────────┘              │
│                                                            │
│  ROW 4: Time Analysis                                      │
│  ┌──────────────────────────────────────────────┐          │
│  │   시간대별 매칭 활동                          │          │
│  └──────────────────────────────────────────────┘          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Step 4: 알람 설정

### 4-1. Critical Alert: 상호 좋아요율 급락

**목적**: 매칭 품질 저하 즉시 감지

#### 설정 방법

1. **Alerts → Create New Alert**

2. **Alert 설정**
   ```
   Name: ⚠️ 상호 좋아요율 급락

   Metric:
   - Report: 상호 좋아요율 (%)
   - Trigger When: Value falls below
   - Threshold: 10%
   - Time Window: Last 24 hours

   Notification:
   - Channel: Slack (#product-alerts)
   - Recipients:
     * Product Manager
     * Data Analyst
   - Message Template:
     "⚠️ 상호 좋아요율이 {value}%로 급락했습니다!
      목표: 15-25%
      즉시 확인이 필요합니다."

   Frequency: Immediate (즉시)
   ```

---

### 4-2. Critical Alert: 매칭 실패율 급증

#### 설정 방법

```
Name: 🚨 매칭 실패 급증

Metric:
- Event: Matching_Failed
- Metric: Count
- Trigger When: Increases by
- Threshold: 50% (compared to previous day)
- Time Window: Last 6 hours

Notification:
- Channel: Slack (#engineering-alerts)
- Message:
  "🚨 매칭 실패가 전일 대비 50% 증가했습니다!
   현재: {value}건
   이전: {previous_value}건
   시스템 점검이 필요합니다."

Frequency: Immediate
```

---

### 4-3. Warning Alert: 채팅 활성화율 저하

#### 설정 방법

```
Name: 📉 채팅 활성화율 저하

Metric:
- Report: 채팅 활성화율 (%)
- Trigger When: Falls below
- Threshold: 25%
- Time Window: Last 3 days

Notification:
- Channel: Slack (#product-alerts)
- Message:
  "📉 채팅 활성화율이 {value}%로 하락했습니다.
   목표: 35%+
   UX 개선을 검토해주세요."

Frequency: Daily at 9 AM
```

---

### 4-4. Weekly Report: 매칭 성과 요약

#### 설정 방법

```
Name: 주간 매칭 성과 리포트

Type: Scheduled Report

Content:
- Dashboard: 매칭 시스템 모니터링
- Include:
  * 상호 좋아요율 추이
  * 전체 매칭 퍼널
  * 매칭 실패 원인 분석

Recipients:
- Product Team
- Engineering Team
- Leadership

Schedule: Every Monday at 9 AM

Format: PDF + Email
```

---

## 실행 체크리스트

### Phase 1: 즉시 실행 (30분)

- [ ] 1-1. 상호 좋아요율 Insight 생성
- [ ] 1-2. 채팅 활성화율 Insight 생성
- [ ] 1-3. 일일 매칭 성공 건수 Insight 생성
- [ ] 2-1. 핵심 매칭 퍼널 생성
- [ ] 3-1. 대시보드 생성 및 Row 1-2 구성

### Phase 2: 1주일 내 (데이터 수집 필요)

- [ ] 1-4. 매칭 실패 원인 분석 Insight 생성
- [ ] 2-2. 무료 vs 재매칭 비교 퍼널 생성
- [ ] 2-3. 빠른 채팅 전환 퍼널 생성
- [ ] 3-2. 대시보드 Row 3-4 추가

### Phase 3: 2주 내 (고도화)

- [ ] 4-1. Critical Alert 3개 설정
- [ ] 4-4. 주간 리포트 설정
- [ ] 코호트 생성 (신규/활성/휴면 사용자)
- [ ] 성별/나이대별 분석 추가

---

## 기대 효과

### 즉각적인 효과

1. **실시간 모니터링**
   - 매칭 품질 저하 즉시 감지
   - 시스템 장애 조기 발견

2. **데이터 기반 의사결정**
   - 무료 vs 재매칭 ROI 검증
   - 기능 개선 우선순위 결정

### 중장기 효과

3. **제품 개선**
   - 매칭 알고리즘 품질 향상
   - UX 개선 포인트 도출

4. **비즈니스 성장**
   - 재매칭권 판매 최적화
   - 사용자 리텐션 증가

---

## 다음 단계

### 추가 대시보드 제안

1. **사용자 코호트 분석 대시보드**
   - 신규/활성/휴면 사용자별 매칭 성과
   - 리텐션 커브 분석

2. **매칭 품질 대시보드**
   - 성별/나이대별 공정성 분석
   - 대학별 매칭 성과

3. **수익화 대시보드**
   - 재매칭권 구매 전환율
   - ARPU (Average Revenue Per User)

---

**작성자**: Development Team
**최종 업데이트**: 2024-12-24
**버전**: 1.0
