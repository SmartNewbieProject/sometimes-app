# 📱 Sometimes App - 빌드 & 배포 가이드

## 🚀 빠른 시작

### 1️⃣ 전체 빌드 프로세스 (대화형)

```bash
# 모든 것을 한 번에 (빌드 + 설치 + TestFlight)
npm run build
# 또는
./scripts/build.sh
```

**선택 옵션:**
- Platform: iOS / Android / Both
- Environment: Production / Preview / Development
- Deployment: Build only / TestFlight / Diawi

---

## 📦 개별 작업

### iPhone에 설치만 하기

```bash
# 최신 빌드를 연결된 iPhone에 설치
npm run install:latest
```

**필수 조건:**
- iPhone을 USB로 연결
- 기기 잠금 해제
- 컴퓨터 신뢰 완료

### TestFlight에 제출만 하기

```bash
# 최신 빌드를 TestFlight에 제출
npm run submit:testflight
```

**필수 조건:**
- App Store Connect API 키 설정 완료
- `.env.production`에 ASC_API_KEY_ID, ASC_API_ISSUER_ID 설정
- 프로젝트 루트에 `AuthKey.p8` 파일 배치

---

## 🔑 TestFlight 자동 제출 설정

### Step 1: API 키 생성

1. https://appstoreconnect.apple.com 접속
2. **Users and Access** → **Integrations** → **App Store Connect API**
3. **Generate API Key** 클릭
   - Name: `EAS Build`
   - Access: `App Manager`
4. 생성 후 다운로드 (⚠️ 한 번만 가능!)
   - **Key ID**: `AB12CD34EF`
   - **Issuer ID**: `12345678-1234-1234-1234-123456789012`
   - **Download**: `AuthKey_AB12CD34EF.p8`

### Step 2: 파일 배치

```bash
# 다운로드한 .p8 파일을 프로젝트 루트로 복사
cp ~/Downloads/AuthKey_*.p8 ./AuthKey.p8
```

### Step 3: 환경변수 설정

`.env.production` 파일 수정:

```bash
# App Store Connect API Keys
ASC_API_KEY_ID=AB12CD34EF
ASC_API_ISSUER_ID=12345678-1234-1234-1234-123456789012
```

### Step 4: 테스트

```bash
npm run submit:testflight
```

---

## 🛠️ 빌드 스크립트 옵션

### Production 빌드
```bash
npm run build:ios          # iOS Production
npm run build:android      # Android Production
```

### Preview 빌드 (내부 테스트)
```bash
npm run build:ios:preview     # iOS Preview
npm run build:android:preview # Android Preview
```

### Development 빌드
```bash
npm run build:ios:dev      # iOS Development
```

---

## 📂 빌드 결과물 위치

모든 빌드 파일은 `builds/` 디렉터리에 저장됩니다:

```
builds/
├── production_20251222_083953/
│   └── build-1766357643759.ipa (63MB)
├── preview_20251222_062642/
│   └── build-1766352392640.ipa
└── ...
```

---

## 🚨 문제 해결

### iPhone 인식 안됨

```bash
# 연결된 기기 확인
xcrun devicectl list devices

# 기기 재연결
# 1. USB 케이블 뽑기
# 2. iPhone 잠금 해제
# 3. USB 다시 연결
# 4. "이 컴퓨터를 신뢰하겠습니까?" → 신뢰
```

### TestFlight 제출 실패

**에러: "ascApiKeyId is not allowed to be empty"**
→ `.env.production`에 API 키 설정 확인

**에러: "API Key not found"**
→ `AuthKey.p8` 파일이 프로젝트 루트에 있는지 확인

**에러: "Invalid API Key"**
→ App Store Connect에서 API Key 권한 확인 (App Manager 권한 필요)

### 대안: Transporter 앱 사용

API 키 설정이 번거로우면 Transporter 앱으로 수동 업로드:

```bash
# Transporter 앱 열기
open -a Transporter

# IPA 파일 드래그 앤 드롭
# builds/production_*/build-*.ipa
```

**Transporter 다운로드:**
https://apps.apple.com/app/transporter/id1450874784

---

## 🔐 보안

⚠️ **절대 Git에 커밋하지 마세요:**
- `AuthKey.p8`
- `.env.production`
- `builds/` 디렉터리

`.gitignore`에 이미 포함되어 있습니다 ✅

---

## 📝 환경변수 파일

| 파일 | 용도 |
|------|------|
| `.env` | Development, Preview, Adhoc |
| `.env.production` | Production 스토어 배포 |
| `.env.local` | 로컬 개발 전용 (Git 제외) |

---

## 🎯 워크플로우 예시

### 시나리오 1: 빠른 테스트

```bash
# 1. Preview 빌드
npm run build:ios:preview

# 2. iPhone에 설치
npm run install:latest
```

### 시나리오 2: Production 배포

```bash
# 1. Production 빌드
npm run build:ios

# 2. TestFlight 제출
npm run submit:testflight

# 3. App Store Connect에서 확인
open https://appstoreconnect.apple.com
```

### 시나리오 3: 전체 자동화

```bash
# 대화형 스크립트 실행
npm run build

# 선택:
# - Platform: iOS
# - Environment: Production
# - Deployment: Build + Auto submit to TestFlight
```

---

## 📊 빌드 시간

| 빌드 타입 | 예상 시간 |
|----------|----------|
| iOS (로컬) | 5-10분 |
| Android (로컬) | 3-7분 |
| iOS + Android | 10-15분 |

---

## 🔗 유용한 링크

- [App Store Connect](https://appstoreconnect.apple.com)
- [EAS Build 문서](https://docs.expo.dev/build/introduction/)
- [TestFlight 가이드](https://developer.apple.com/testflight/)
- [프로젝트 Wiki](./TESTFLIGHT_SETUP.md)
