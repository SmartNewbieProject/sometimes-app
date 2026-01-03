# TestFlight 자동 제출 설정 가이드

## 📋 필요한 정보

TestFlight에 자동으로 제출하려면 다음 3가지가 필요합니다:

1. **App Store Connect API Key** (`.p8` 파일)
2. **Key ID**
3. **Issuer ID**

---

## 🔑 Step 1: App Store Connect API Key 생성

### 1. App Store Connect 로그인
https://appstoreconnect.apple.com

### 2. Users and Access > Integrations > App Store Connect API
- 좌측 메뉴에서 **Users and Access** 클릭
- 상단 탭에서 **Integrations** 클릭
- **App Store Connect API** 섹션에서 **Generate API Key** 클릭

### 3. API Key 생성
- **Name**: `EAS Build` (또는 원하는 이름)
- **Access**: `App Manager` 선택
- **Generate** 클릭

### 4. 생성된 정보 저장
생성 후 다음 정보를 확인하고 저장하세요:

- **Key ID**: 예) `AB12CD34EF`
- **Issuer ID**: 예) `12345678-1234-1234-1234-123456789012`
- **Download API Key**: `.p8` 파일 다운로드 (⚠️ 한 번만 다운로드 가능!)

---

## 📁 Step 2: 파일 배치

다운로드한 `.p8` 파일을 프로젝트 루트에 `AuthKey.p8`로 저장:

```bash
# 다운로드한 파일명: AuthKey_AB12CD34EF.p8
# 프로젝트 루트에 복사
cp ~/Downloads/AuthKey_*.p8 /Users/user/projects/sometimes-app/AuthKey.p8
```

---

## 🔐 Step 3: 환경변수 설정

### 방법 1: `.env.production`에 추가 (로컬 빌드용)

```bash
# .env.production 파일에 추가
ASC_API_KEY_ID=AB12CD34EF
ASC_API_ISSUER_ID=12345678-1234-1234-1234-123456789012
```

### 방법 2: EAS Secret 설정 (클라우드 빌드용)

```bash
eas secret:create --scope project --name ASC_API_KEY_ID --value "AB12CD34EF"
eas secret:create --scope project --name ASC_API_ISSUER_ID --value "12345678-1234-1234-1234-123456789012"
```

---

## ✅ Step 4: 확인 및 테스트

### 빌드 + TestFlight 자동 제출
```bash
./scripts/build.sh

# Production 선택
# "Build + Auto submit to TestFlight" 선택
```

### 수동 제출 (이미 빌드된 경우)
```bash
eas submit --platform ios --profile production --latest
```

---

## 🚨 보안 주의사항

⚠️ **절대 Git에 커밋하지 마세요:**
- `AuthKey.p8`
- `.env.production` (이미 .gitignore에 있음)

`.gitignore` 확인:
```gitignore
# Environment variables
.env
.env.*

# API Keys
AuthKey*.p8
*.p8
```

---

## 🔍 문제 해결

### "ascApiKeyId is not allowed to be empty" 에러
→ `.env.production`에 `ASC_API_KEY_ID` 추가 또는 EAS Secret 설정

### "API Key not found" 에러
→ `AuthKey.p8` 파일이 프로젝트 루트에 있는지 확인

### 권한 부족 에러
→ App Store Connect에서 API Key 권한을 `App Manager`로 설정

---

## 📝 현재 설정 상태

`eas.json`의 submit 설정:
```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "6746120889",
        "ascApiKeyPath": "./AuthKey.p8",
        "ascApiKeyId": "${ASC_API_KEY_ID}",
        "ascApiKeyIssuerId": "${ASC_API_ISSUER_ID}"
      }
    }
  }
}
```

---

## 🎯 대안: Transporter 앱으로 수동 업로드

API 키 설정이 번거로우면 Transporter 앱 사용:

```bash
# Transporter 앱 열기
open -a Transporter

# IPA 파일 드래그 앤 드롭
# → 자동으로 TestFlight에 업로드
```

Transporter 다운로드:
https://apps.apple.com/app/transporter/id1450874784
