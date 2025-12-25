# 🔑 App Store Connect API Key 설정 (5분 가이드)

## 왜 API 키가 필요한가요?

API 키를 설정하면:
- ✅ `npm run submit:testflight` 한 번에 자동 제출
- ✅ CI/CD 파이프라인에서 자동 배포 가능
- ✅ Transporter 앱 없이도 TestFlight 업로드

**안 해도 됨**: Transporter 앱으로 수동 업로드해도 괜찮습니다!

---

## 📝 Step 1: API Key 생성 (3분)

### 1. App Store Connect 접속
https://appstoreconnect.apple.com

### 2. API Key 생성 페이지 이동
좌측 메뉴: **Users and Access** → 상단 탭: **Integrations** → **App Store Connect API**

### 3. Generate API Key 클릭
- **Name**: `EAS Build` (또는 원하는 이름)
- **Access**: `App Manager` 선택 ⚠️
- **Generate** 버튼 클릭

### 4. 정보 저장
생성 후 화면에서:

**① Key ID** (복사)
```
예: AB12CD34EF
```

**② Issuer ID** (복사)
```
예: 12345678-1234-1234-1234-123456789012
```

**③ Download API Key** (⚠️ 한 번만 다운로드 가능!)
```
파일명: AuthKey_AB12CD34EF.p8
```

---

## 📁 Step 2: 파일 배치 (1분)

### 다운로드한 .p8 파일을 프로젝트 루트로 이동

```bash
# 다운로드 폴더에서 프로젝트로 복사
cp ~/Downloads/AuthKey_*.p8 /Users/user/projects/sometimes-app/AuthKey.p8

# 권한 확인
ls -la AuthKey.p8
```

**결과**:
```
-rw-r--r--  1 user  staff  272 Dec 22 09:30 AuthKey.p8
```

---

## ⚙️ Step 3: 환경변수 설정 (1분)

### .env.production 파일 수정

파일: `/Users/user/projects/sometimes-app/.env.production`

**기존**:
```bash
ASC_API_KEY_ID=YOUR_KEY_ID_HERE
ASC_API_ISSUER_ID=YOUR_ISSUER_ID_HERE
```

**수정**:
```bash
ASC_API_KEY_ID=AB12CD34EF
ASC_API_ISSUER_ID=12345678-1234-1234-1234-123456789012
```

**저장** ✅

---

## ✅ Step 4: 테스트

```bash
npm run submit:testflight
```

**예상 출력**:
```
[INFO] Latest build:
  build-1766363173770.ipa
  63M

Submit this build to TestFlight? [y/N]: y

[STEP] Submitting to TestFlight...

✅ Submitted to TestFlight!
```

---

## 🔒 보안 확인

### .gitignore 확인

이미 설정되어 있어야 함:

```gitignore
# API Keys
*.p8
AuthKey*.p8

# Environment variables
.env
.env.*
```

**확인**:
```bash
git status
# AuthKey.p8와 .env.production이 Untracked files에 없어야 함 ✅
```

---

## 🚨 문제 해결

### "API Key not found" 에러
→ `AuthKey.p8` 파일이 프로젝트 **루트**에 있는지 확인

```bash
# 현재 위치 확인
pwd
# 출력: /Users/user/projects/sometimes-app

# 파일 존재 확인
ls -la AuthKey.p8
```

### "Invalid API Key" 에러
→ App Store Connect에서 API Key **권한** 확인
- Access: `App Manager` 필수
- Status: `Active`

### "ascApiKeyId is empty" 에러
→ `.env.production` 파일 확인

```bash
cat .env.production | grep ASC_API
# 출력:
# ASC_API_KEY_ID=AB12CD34EF (실제 값이 들어가 있어야 함)
# ASC_API_ISSUER_ID=12345678-...
```

---

## 💡 대안: Transporter 앱 계속 사용

API 키 설정이 번거로우면 **Transporter 앱을 계속 사용**해도 됩니다!

```bash
# 1. Transporter 앱 열기
open -a Transporter

# 2. IPA 파일 Finder에서 열기
npm run build:ios  # 빌드 후
open builds/production_*/build-*.ipa

# 3. 드래그 앤 드롭 → Deliver 클릭
```

**장점**:
- 설정 불필요
- 간단명료
- 시각적으로 업로드 진행 상황 확인

**단점**:
- 수동 작업 필요
- CI/CD 자동화 불가능

---

## 📊 비교

| 방법 | 설정 시간 | 사용 편의성 | 자동화 |
|------|----------|-----------|--------|
| **Transporter** | 0분 | ⭐⭐⭐ | ❌ |
| **API Key** | 5분 | ⭐⭐⭐⭐⭐ | ✅ |

---

## 🎯 추천

- **처음 1-2회**: Transporter 앱 사용
- **자주 배포**: API 키 설정 (한 번만 하면 계속 편함)
- **팀 협업/CI**: API 키 필수

---

## 🔗 관련 문서

- [Apple Developer - Creating API Keys](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)
- [빌드 & 배포 가이드](./BUILD_AND_DEPLOY.md)
- [빠른 참조](./QUICK_REFERENCE.md)
