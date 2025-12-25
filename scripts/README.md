# Mixpanel Dashboard Scripts

이 디렉터리에는 Mixpanel 매칭 대시보드를 생성하고 관리하기 위한 스크립트들이 포함되어 있습니다.

## 📁 파일 구조

```
scripts/
├── README.md (이 파일)
├── create-mixpanel-dashboard.js      # 대시보드 구성 JSON 생성
├── mixpanel-dashboard-config.json     # 생성된 대시보드 구성 (출력)
├── test-service-account.js            # Service Account 인증 테스트
└── deploy-mixpanel-dashboard.js       # 자동 배포 스크립트 (Service Account 필요)
```

---

## 🚀 빠른 시작

### 옵션 1: 수동 생성 (추천 - 15-30분)

Service Account가 없거나 빠르게 시작하고 싶다면:

```bash
# 📚 수동 설정 가이드 참조
cat docs/MIXPANEL_DASHBOARD_MANUAL_SETUP.md
```

**장점**: 권한 불필요, 즉시 시작 가능
**단점**: 반복 작업 시 번거로움

---

### 옵션 2: 자동 배포 (Service Account 필요)

#### Step 1: Service Account 설정

```bash
# 📚 Service Account 설정 가이드 참조
cat docs/MIXPANEL_SERVICE_ACCOUNT_SETUP.md
```

**필요한 작업**:
1. Mixpanel → Organization Settings → Service Accounts → Create
2. Credentials를 `.env.local`에 추가:
   ```bash
   MIXPANEL_SERVICE_ACCOUNT_USERNAME=your_id.mp-service-account
   MIXPANEL_SERVICE_ACCOUNT_SECRET=your_secret_key
   ```

#### Step 2: 인증 테스트

```bash
node scripts/test-service-account.js
```

**성공 시 출력**:
```
✅ All tests passed!
🚀 Your Service Account is properly configured.
```

#### Step 3: 자동 배포 실행

```bash
node scripts/deploy-mixpanel-dashboard.js
```

**성공 시**:
```
✅ Insights created: 3/3
✅ Funnels created: 1/1
✅ Dashboard: 매칭 시스템 모니터링
🎉 Dashboard successfully created!
```

---

## 📜 스크립트 설명

### 1. `create-mixpanel-dashboard.js`

**용도**: 대시보드 구성을 JSON 파일로 생성

**실행**:
```bash
node scripts/create-mixpanel-dashboard.js
```

**출력**: `scripts/mixpanel-dashboard-config.json`

**내용**:
- 5개 Insights 설정
- 1개 Funnel 설정
- Dashboard 레이아웃 정의

**사용 시기**:
- 대시보드 구조 검토
- 수동 생성 시 참조 자료
- CI/CD 파이프라인에서 설정 관리

---

### 2. `test-service-account.js`

**용도**: Service Account 인증 테스트

**실행**:
```bash
node scripts/test-service-account.js
```

**테스트 항목**:
1. ✅ Project 접근 권한
2. ✅ Saved Reports 읽기 권한
3. ✅ Credentials 유효성

**에러 메시지**:
- `401 Unauthorized`: Credentials 오류
- `403 Forbidden`: 권한 부족
- `404 Not Found`: Project ID 오류

---

### 3. `deploy-mixpanel-dashboard.js`

**용도**: 대시보드를 Mixpanel에 자동 생성

**실행**:
```bash
node scripts/deploy-mixpanel-dashboard.js
```

**전제 조건**:
- ✅ Service Account credentials 설정
- ✅ `mixpanel-dashboard-config.json` 존재
- ✅ 필요 권한 (Projects Write, Saved Reports Write, Boards Write)

**실행 흐름**:
1. 설정 파일 로드
2. Insights 생성 (3개)
3. Funnels 생성 (1개)
4. Dashboard 조립 및 생성

**Rate Limiting**: 각 API 호출 사이 1초 대기

---

## 🔒 환경 변수

### 이벤트 트래킹용 (현재 설정됨)

```bash
# .env.local
MIXPANEL_PROJECT_TOKEN=3f1b97d815027821e7e1e93c73bad5a4
MIXPANEL_PROJECT_ID=3375891
```

**용도**: 클라이언트에서 Mixpanel로 이벤트 전송

---

### Service Account용 (자동 배포 시 필요)

```bash
# .env.local
MIXPANEL_SERVICE_ACCOUNT_USERNAME=your_id.mp-service-account
MIXPANEL_SERVICE_ACCOUNT_SECRET=your_long_secret_key
```

**용도**: 서버 사이드에서 대시보드/Insight 생성

**발급 방법**: `docs/MIXPANEL_SERVICE_ACCOUNT_SETUP.md` 참조

---

## 🎯 대시보드 구성 요소

### KPI Metrics (5개)

| Insight | 수식 | 목표 |
|---------|------|------|
| 상호 좋아요율 | `(Match_Accepted / Like_Sent) × 100` | 15-25% |
| 채팅 활성화율 | `(Chat_24h_Active(mutual) / Chat_Started) × 100` | 35%+ |
| 일일 매칭 성공 건수 | `COUNT(Matching_Success)` | - |
| 매칭 성공률 | `(Matching_Success / Matching_Started) × 100` | 60%+ |
| 매칭 실패 원인 분포 | `Matching_Failed by failure_category` | - |

### Funnel (1개)

**전체 매칭 퍼널** (5단계):
1. `Matching_Success` - 알고리즘 매칭 성공
2. `Like_Sent` - 좋아요 전송
3. `Match_Accepted` - 상호 좋아요
4. `Chat_Started` - 채팅방 생성
5. `Chat_24h_Active` - 24시간 내 활성 대화

**Conversion Window**: 14일

---

## 🛠 문제 해결

### Q: "Service Account credentials not found" 에러

**A**: `.env.local`에 다음을 추가하세요:
```bash
MIXPANEL_SERVICE_ACCOUNT_USERNAME=your_id.mp-service-account
MIXPANEL_SERVICE_ACCOUNT_SECRET=your_secret
```

### Q: "401 Unauthorized" 에러

**A**: Credentials 확인:
1. Username 형식: `{id}.mp-service-account`
2. Secret에 공백이 없는지 확인
3. 환경 변수 이름 오타 확인

### Q: "403 Forbidden" 에러

**A**: Service Account Scopes 확인:
- Mixpanel → Organization Settings → Service Accounts
- 필요 권한: Projects Write, Saved Reports Write, Boards Write

### Q: "Configuration file not found" 에러

**A**: 먼저 구성 파일 생성:
```bash
node scripts/create-mixpanel-dashboard.js
```

---

## 📚 관련 문서

| 문서 | 용도 |
|------|------|
| [MIXPANEL_DASHBOARD_MANUAL_SETUP.md](../docs/MIXPANEL_DASHBOARD_MANUAL_SETUP.md) | 수동 생성 체크리스트 ⭐ |
| [MIXPANEL_SERVICE_ACCOUNT_SETUP.md](../docs/MIXPANEL_SERVICE_ACCOUNT_SETUP.md) | Service Account 설정 가이드 |
| [MIXPANEL_DEPLOYMENT_SUMMARY.md](../docs/MIXPANEL_DEPLOYMENT_SUMMARY.md) | 전체 프로젝트 요약 |
| [MIXPANEL_MATCHING_DASHBOARD_GUIDE.md](../docs/MIXPANEL_MATCHING_DASHBOARD_GUIDE.md) | 완전한 단계별 가이드 |
| [MIXPANEL_QUICK_REFERENCE.md](../docs/MIXPANEL_QUICK_REFERENCE.md) | 빠른 참조 가이드 |
| [MIXPANEL_TRACKING_ENHANCEMENTS.md](../docs/MIXPANEL_TRACKING_ENHANCEMENTS.md) | 코드 개선 문서 |

---

## 🚀 권장 워크플로우

### 처음 설정하는 경우

```bash
# 1. 수동으로 빠르게 시작 (추천)
cat docs/MIXPANEL_DASHBOARD_MANUAL_SETUP.md
# → Mixpanel UI에서 15-30분 작업

# 또는

# 2. Service Account 설정 후 자동화
cat docs/MIXPANEL_SERVICE_ACCOUNT_SETUP.md
# → Service Account 발급
# → .env.local 설정
node scripts/test-service-account.js
# → 인증 테스트
node scripts/deploy-mixpanel-dashboard.js
# → 자동 배포
```

### 대시보드 업데이트

```bash
# 1. 설정 파일 수정
vi scripts/mixpanel-dashboard-config.json

# 2. 재배포 (Service Account 있는 경우)
node scripts/deploy-mixpanel-dashboard.js

# 또는 수동으로 Mixpanel UI에서 수정
```

---

## 📊 다음 단계

대시보드 생성 후:

1. **데이터 검증**
   - Mixpanel → Events에서 이벤트 수집 확인
   - 대시보드에서 "No data" 없는지 확인

2. **Alert 설정**
   - 상호 좋아요율 < 10% → Slack 알림
   - 매칭 실패율 > 40% → 이메일 알림

3. **팀 공유**
   - 대시보드 링크 공유
   - 주간 리뷰 미팅에서 활용

4. **최적화**
   - Cohort 분석 추가
   - A/B 테스트 결과 트래킹
   - 추가 KPI 정의

---

**마지막 업데이트**: 2025-12-24
