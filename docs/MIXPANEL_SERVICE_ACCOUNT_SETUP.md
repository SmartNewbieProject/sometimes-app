# Mixpanel Service Account 인증 설정 가이드

## 🔐 Service Account란?

Mixpanel은 두 가지 인증 방식을 제공합니다:

| 인증 타입 | 용도 | 권한 | 현재 보유 여부 |
|---------|------|------|---------------|
| **Project Token** | 클라이언트 이벤트 전송 | 읽기 전용 (이벤트 전송만) | ✅ 보유 |
| **Service Account** | 서버 사이드 관리 작업 | 읽기/쓰기 (대시보드, Insight 생성) | ❌ 미보유 |

**Service Account**는 Mixpanel의 Management API를 사용하여 대시보드, Insight, Alert 등을 프로그래밍 방식으로 생성/수정/삭제할 수 있는 OAuth 2.0 기반 인증 시스템입니다.

---

## 📋 Service Account 생성 절차

### 1단계: Mixpanel Organization Settings 접근

#### 필요 권한
- **Organization Owner** 또는 **Admin** 권한 필요
- 권한이 없다면 조직 관리자에게 요청

#### 접근 방법
1. Mixpanel 로그인: https://mixpanel.com/
2. 우측 상단 프로필 아이콘 클릭
3. **Organization Settings** 선택
4. 좌측 메뉴에서 **Service Accounts** 클릭

---

### 2단계: Service Account 생성

#### UI에서 생성 (추천)

1. **Service Accounts** 페이지에서 **Create Service Account** 클릭

2. **기본 정보 입력**:
   ```
   Name: Mixpanel Dashboard Automation
   Description: Automated dashboard and insight creation for matching system
   ```

3. **Scope (권한) 선택**:
   - ✅ **Projects: Read** - 프로젝트 정보 조회
   - ✅ **Projects: Write** - 대시보드/Insight 생성
   - ✅ **Saved Reports: Read** - 기존 Insight 조회
   - ✅ **Saved Reports: Write** - Insight 생성/수정
   - ✅ **Boards: Read** - 대시보드 조회
   - ✅ **Boards: Write** - 대시보드 생성/수정
   - ⚠️ **Organization Settings: Write** - 불필요 (보안상 비추천)

4. **프로젝트 접근 권한**:
   - **Selected Projects** 선택
   - Project ID `3375891` 선택

5. **Create** 클릭

---

### 3단계: Credentials 다운로드

생성 직후 **단 한 번만** 표시되는 정보:

```json
{
  "username": "서비스계정ID.mp-service-account",
  "secret": "매우긴랜덤문자열"
}
```

⚠️ **중요**: 이 정보는 다시 볼 수 없으므로 안전한 곳에 저장!

**권장 저장 위치**:
1. 암호 관리자 (1Password, LastPass 등)
2. 팀 공유 비밀 관리 도구 (Vault, AWS Secrets Manager)
3. `.env.local` (Git에는 절대 커밋하지 않기!)

---

## 🔧 프로젝트에 Service Account 설정

### 1. 환경 변수 추가

`.env.local` 파일에 다음 추가:

```bash
# Mixpanel Service Account (Management API)
MIXPANEL_SERVICE_ACCOUNT_USERNAME=서비스계정ID.mp-service-account
MIXPANEL_SERVICE_ACCOUNT_SECRET=매우긴랜덤문자열

# 기존 Project Token (이벤트 전송용 - 유지)
MIXPANEL_PROJECT_TOKEN=3f1b97d815027821e7e1e93c73bad5a4
MIXPANEL_PROJECT_ID=3375891
```

### 2. `.env.local`이 `.gitignore`에 포함되었는지 확인

```bash
# .gitignore에 다음이 있는지 확인
.env.local
.env*.local
```

---

## 🔄 배포 스크립트 수정

Service Account를 사용하도록 `scripts/deploy-mixpanel-dashboard.js` 수정:

```javascript
// 기존 코드 (Project Token 사용)
const MIXPANEL_API_SECRET = process.env.MIXPANEL_API_SECRET || '3f1b97d815027821e7e1e93c73bad5a4';
const authToken = Buffer.from(`${MIXPANEL_API_SECRET}:`).toString('base64');

// ↓↓↓ 아래로 변경 ↓↓↓

// 수정된 코드 (Service Account 사용)
const MIXPANEL_SERVICE_USERNAME = process.env.MIXPANEL_SERVICE_ACCOUNT_USERNAME;
const MIXPANEL_SERVICE_SECRET = process.env.MIXPANEL_SERVICE_ACCOUNT_SECRET;

if (!MIXPANEL_SERVICE_USERNAME || !MIXPANEL_SERVICE_SECRET) {
  console.error('❌ Error: Service Account credentials not found');
  console.error('   Please set MIXPANEL_SERVICE_ACCOUNT_USERNAME and MIXPANEL_SERVICE_ACCOUNT_SECRET');
  process.exit(1);
}

// Service Account 인증 토큰 (username:secret)
const authToken = Buffer.from(`${MIXPANEL_SERVICE_USERNAME}:${MIXPANEL_SERVICE_SECRET}`).toString('base64');
```

---

## 🧪 인증 테스트

Service Account가 제대로 설정되었는지 테스트:

### 간단한 테스트 스크립트

`scripts/test-service-account.js` 생성:

```javascript
#!/usr/bin/env node

const https = require('https');

const username = process.env.MIXPANEL_SERVICE_ACCOUNT_USERNAME;
const secret = process.env.MIXPANEL_SERVICE_ACCOUNT_SECRET;
const projectId = process.env.MIXPANEL_PROJECT_ID || '3375891';

if (!username || !secret) {
  console.error('❌ Service Account credentials not found');
  process.exit(1);
}

const authToken = Buffer.from(`${username}:${secret}`).toString('base64');

function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mixpanel.com',
      path: `/api/app/projects/${projectId}`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Service Account authentication successful!');
          console.log('📊 Project info:', JSON.parse(body));
          resolve();
        } else {
          console.error(`❌ Authentication failed: ${res.statusCode}`);
          console.error(body);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

testAPI().catch(console.error);
```

### 테스트 실행

```bash
chmod +x scripts/test-service-account.js
node scripts/test-service-account.js
```

**성공 시 출력**:
```
✅ Service Account authentication successful!
📊 Project info: { id: 3375891, name: "Sometimes App", ... }
```

**실패 시**:
- `401 Unauthorized` → Credentials 확인
- `403 Forbidden` → Scope 권한 확인
- `404 Not Found` → Project ID 확인

---

## 🚀 자동 배포 실행

인증 테스트 성공 후:

```bash
node scripts/deploy-mixpanel-dashboard.js
```

**예상 출력**:
```
╔══════════════════════════════════════════════════════════╗
║   Mixpanel 매칭 대시보드 배포 스크립트                   ║
║   Project ID: 3375891                                    ║
╚══════════════════════════════════════════════════════════╝

✅ Configuration loaded

============================================================
STEP 1: Creating Insights
============================================================

📊 Creating insight: 상호 좋아요율 (%)...
✅ Created: 상호 좋아요율 (%)

📊 Creating insight: 채팅 활성화율 (%)...
✅ Created: 채팅 활성화율 (%)

...

🎉 Dashboard successfully created!
📊 View it at: https://mixpanel.com/project/3375891/view/{id}/dashboard
```

---

## 🔒 보안 모범 사례

### DO ✅

1. **환경 변수 사용**: `.env.local`에 저장, Git 커밋 금지
2. **최소 권한 원칙**: 필요한 Scope만 부여
3. **정기적 로테이션**: 6개월마다 Secret 갱신
4. **모니터링**: Service Account 사용 로그 확인
5. **팀 공유**: 안전한 비밀 관리 도구 사용

### DON'T ❌

1. **코드에 하드코딩**: 절대 소스코드에 직접 입력 금지
2. **Public Repository**: `.env.local` 절대 커밋 금지
3. **과도한 권한**: Organization Settings Write 불필요
4. **공유 계정**: 개인별 Service Account 사용 권장
5. **로그 노출**: Secret이 로그에 출력되지 않도록 주의

---

## 🔍 문제 해결

### Q1: Service Account 메뉴가 안 보여요

**A**: Organization Owner/Admin 권한이 필요합니다.
- 조직 관리자에게 권한 요청
- 또는 관리자에게 Service Account 생성 요청

### Q2: 401 Unauthorized 에러가 계속 발생해요

**A**: 체크리스트:
1. Username 형식: `{id}.mp-service-account` 확인
2. Secret 복사 시 공백 포함 여부 확인
3. 환경 변수 이름 오타 확인: `MIXPANEL_SERVICE_ACCOUNT_*`
4. `.env.local` 파일 위치 확인 (프로젝트 루트)

### Q3: 403 Forbidden 에러가 발생해요

**A**: Scope 권한 확인:
1. Mixpanel → Organization Settings → Service Accounts
2. 해당 Service Account 클릭
3. Scopes 탭에서 필요 권한 추가:
   - Projects: Write
   - Saved Reports: Write
   - Boards: Write

### Q4: Service Account Secret을 잃어버렸어요

**A**: 복구 불가능합니다.
1. 기존 Service Account 삭제
2. 새로운 Service Account 생성
3. 새 Credentials로 환경 변수 업데이트

---

## 📚 참고 자료

### Mixpanel 공식 문서

- [Service Accounts Overview](https://developer.mixpanel.com/reference/service-accounts)
- [Management API Authentication](https://developer.mixpanel.com/reference/authentication)
- [API Reference](https://developer.mixpanel.com/reference/overview)

### 내부 문서

- [배포 요약](./MIXPANEL_DEPLOYMENT_SUMMARY.md)
- [수동 설정 가이드](./MIXPANEL_DASHBOARD_MANUAL_SETUP.md)
- [트래킹 개선사항](./MIXPANEL_TRACKING_ENHANCEMENTS.md)

---

## ✅ 완료 체크리스트

Service Account 설정 완료 후 확인:

- [ ] Service Account 생성 완료
- [ ] Username & Secret 안전하게 저장
- [ ] `.env.local`에 환경 변수 추가
- [ ] `.gitignore`에 `.env.local` 포함 확인
- [ ] `test-service-account.js` 실행 성공
- [ ] `deploy-mixpanel-dashboard.js` 수정 완료
- [ ] 자동 배포 스크립트 실행 성공
- [ ] 생성된 대시보드 Mixpanel UI에서 확인

---

## 🎯 다음 단계

Service Account 설정 완료 후:

1. **자동 배포 실행**: `node scripts/deploy-mixpanel-dashboard.js`
2. **대시보드 확인**: Mixpanel UI에서 생성된 항목 검증
3. **CI/CD 통합**: GitHub Actions 등에서 자동 배포 설정
4. **팀 공유**: Service Account 사용 가이드 팀원에게 전달

---

**작성일**: 2025-12-24
**마지막 업데이트**: 2025-12-24
