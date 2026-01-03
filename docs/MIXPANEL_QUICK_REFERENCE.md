# Mixpanel 매칭 대시보드 - 빠른 참고 가이드

> **프로젝트**: Sometimes App
> **접속**: https://mixpanel.com/project/3375891

---

## 🚀 30분 안에 대시보드 만들기

### Step 1: 상호 좋아요율 (5분)

```
Insights → Create New Report

Chart Type: Number
Event A: Match_Accepted (Count)
Event B: Like_Sent (Count)
Formula: (A / B) * 100

Name: 상호 좋아요율 (%)
Save
```

✅ **목표**: 15-25%
⚠️ **경고**: < 10%

---

### Step 2: 채팅 활성화율 (5분)

```
Insights → Create New Report

Chart Type: Number
Event A: Chat_24h_Active
  Filter: activity_status = 'mutual'
  Count
Event B: Chat_Started (Count)
Formula: (A / B) * 100

Name: 채팅 활성화율 (%)
Save
```

✅ **목표**: 35%+
⚠️ **경고**: < 25%

---

### Step 3: 매칭 퍼널 (10분)

```
Funnels → Create New Funnel

Steps:
1. Matching_Success
2. Like_Sent
3. Match_Accepted
4. Chat_Started
5. Chat_24h_Active (activity_status != 'inactive')

Conversion Window: 14 days
Name: 전체 매칭 퍼널
Save
```

**예상 전환율**:
- Step 1→2: 75%
- Step 2→3: 18% ⚠️ **Critical**
- Step 3→4: 92%
- Step 4→5: 38%

---

### Step 4: 대시보드 구성 (10분)

```
Dashboards → Create New Dashboard
Name: 매칭 시스템 모니터링

Add Widgets:
Row 1: 상호 좋아요율, 채팅 활성화율 (Small)
Row 2: 전체 매칭 퍼널 (Large, Full Width)

Save & Share
```

---

## 📊 핵심 KPI 요약표

| KPI | 현재 이벤트 | 계산식 | 목표 | Critical |
|-----|-----------|-------|------|----------|
| 상호 좋아요율 | Match_Accepted / Like_Sent | (A/B) × 100 | 15-25% | < 10% |
| 채팅 활성화율 | Chat_24h_Active (mutual) / Chat_Started | (A/B) × 100 | 35%+ | < 25% |
| 채팅방 진입률 | Chat_Started / Match_Accepted | (A/B) × 100 | 90%+ | < 80% |
| 매칭 성공률 | Matching_Success / (총 시도) | (A/B) × 100 | 85%+ | < 70% |

---

## 🔍 자주 사용하는 필터

### 무료 vs 재매칭 비교

```
Breakdown By: matching_type
Values: 'auto', 'rematch'
```

### 활성 대화만 추출

```
Event: Chat_24h_Active
Filter: activity_status = 'mutual'
  OR is_mutual_conversation = true
```

### 특정 실패 유형

```
Event: Matching_Failed
Filter: failure_category = 'PAYMENT'
```

---

## 📅 시간 범위 권장

| 분석 목적 | Time Range | 이유 |
|----------|------------|------|
| 실시간 모니터링 | Last 24 hours | 즉각 대응 |
| 주간 리뷰 | Last 7 days | 트렌드 파악 |
| 월간 리포트 | Last 30 days | 성과 측정 |
| 분기 분석 | Last 90 days | 전략 수립 |

---

## 🚨 알람 설정 템플릿

### Critical Alert: 상호 좋아요율 급락

```
Trigger: 상호 좋아요율 < 10%
Window: Last 24 hours
Channel: Slack #product-alerts
Frequency: Immediate
```

### Warning Alert: 채팅 활성화율 저하

```
Trigger: 채팅 활성화율 < 25%
Window: Last 3 days
Channel: Slack #product-alerts
Frequency: Daily at 9 AM
```

---

## 💡 빠른 인사이트 체크

### ✅ 건강한 매칭 시스템

- 상호 좋아요율: 18-22%
- 채팅 활성화율: 35-45%
- 일일 매칭 성공: 100건 이상
- 매칭 실패 (PAYMENT): < 30%

### ⚠️ 주의 필요

- 상호 좋아요율: 10-15%
- 채팅 활성화율: 25-35%
- 일일 매칭 성공: 50-100건
- 매칭 실패 (PAYMENT): 30-50%

### 🚨 긴급 조치 필요

- 상호 좋아요율: < 10%
- 채팅 활성화율: < 25%
- 일일 매칭 성공: < 50건
- 매칭 실패 (PAYMENT): > 50%

---

## 🔗 유용한 링크

- **Mixpanel 프로젝트**: https://mixpanel.com/project/3375891
- **이벤트 정의**: `src/shared/constants/mixpanel-events.ts`
- **상세 가이드**: `docs/MIXPANEL_MATCHING_DASHBOARD_GUIDE.md`
- **트래킹 개선사항**: `docs/MIXPANEL_TRACKING_ENHANCEMENTS.md` 🆕
- **KPI 문서**: `KPI.md`

---

## 🆕 최근 업데이트 (2024-12-24)

### 추가된 기능

1. ✅ **Matching_Started 이벤트 추가** (재매칭 시작 트래킹)
2. ✅ **Match_Accepted 시각 저장** (채팅 전환 시간 계산)
3. ✅ **Chat_Started에 time_since_match_accepted 추가**

### 새로운 대시보드 차트

**Match_Accepted → Chat_Started 시간 분석**:
```
Event: Chat_Started
Filter: time_since_match_accepted is set
Metric: Property Distribution
Bins: [0-1h, 1-3h, 3-6h, 6-12h, 12-24h]
Chart Type: Histogram
```

---

**최종 업데이트**: 2024-12-24
