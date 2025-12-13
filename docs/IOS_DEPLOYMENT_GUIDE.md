# 📱 iOS 앱 배포 가이드

빌드한 IPA 파일을 아이폰에 설치하는 다양한 방법을 안내합니다.

---

## 🎯 방법 비교

| 방법 | 속도 | 편의성 | 사용 사례 |
|------|------|--------|----------|
| **TestFlight** ⭐ | ⏱️ 느림 (1-2시간) | ⭐⭐⭐⭐⭐ | 프로덕션 테스트, 여러 테스터 |
| **Diawi** | ⚡ 빠름 (즉시) | ⭐⭐⭐⭐ | 빠른 내부 테스트 |
| **Xcode 직접 설치** | ⚡ 즉시 | ⭐⭐ | 개발자 단일 기기 테스트 |
| **App Store** | ⏱️ 매우 느림 (1-3일) | ⭐⭐⭐⭐⭐ | 정식 출시 |

---

## 🥇 방법 1: TestFlight (추천!)

### 특징
- ✅ Apple 공식 베타 테스트 도구
- ✅ 무선(OTA) 설치 - 케이블 불필요
- ✅ 자동 업데이트 알림
- ✅ 최대 100명의 외부 테스터 초대 가능
- ✅ 크래시 리포트 자동 수집
- ⏱️ Apple 검토 대기 시간 (1-2시간, 최대 24시간)

### 사용 방법

#### A. 인터랙티브 빌드 스크립트 사용
```bash
./scripts/build.sh

# 선택 화면에서:
# 1. Platform: iOS
# 2. Environment: Production
# 3. Deployment: Build + Auto submit to TestFlight
```

#### B. 명령어로 직접 실행
```bash
# 1. 빌드
npm run build:ios

# 2. TestFlight에 자동 제출
eas submit --platform ios --profile production --latest

# 또는 한 번에
eas build --platform ios --profile production --local --auto-submit
```

### TestFlight 앱에서 설치
1. iPhone에서 **TestFlight 앱** 다운로드 (App Store)
2. Apple Developer 계정으로 로그인
3. 앱 목록에서 "Sometimes" 선택
4. **설치** 버튼 탭

### 외부 테스터 초대
```bash
# App Store Connect에서:
# 1. TestFlight 섹션 접속
# 2. "External Testing" 탭
# 3. 그룹 생성 또는 기존 그룹 선택
# 4. 테스터 이메일 추가
# 5. Export Compliance 정보 입력 (최초 1회)
```

---

## 🥈 방법 2: Diawi (빠른 테스트용)

### 특징
- ⚡ 즉시 설치 가능 (Apple 검토 없음)
- 🔗 링크만 공유하면 설치 가능
- 📱 등록된 UDID 기기만 설치 가능
- 📅 무료 버전은 7일 후 자동 삭제
- 💰 유료 플랜: 무제한 보관

### 사전 준비
```bash
# 1. Diawi 계정 생성
# https://www.diawi.com/

# 2. API 토큰 발급
# https://www.diawi.com/dashboard/api/tokens

# 3. 환경변수 설정
echo 'export DIAWI_API_TOKEN="your-token-here"' >> ~/.zshrc
source ~/.zshrc
```

### 사용 방법

#### A. 인터랙티브 빌드 스크립트 사용
```bash
./scripts/build.sh

# 선택 화면에서:
# 1. Platform: iOS
# 2. Environment: Production
# 3. Deployment: Build + Upload to Diawi
```

#### B. 수동 업로드
```bash
# 1. Ad Hoc 프로필로 빌드
eas build --platform ios --profile adhoc --local

# 2. Diawi에 업로드
./scripts/upload-to-diawi.sh build-xxxx.ipa

# 3. 생성된 링크 공유
# https://i.diawi.com/XXXXXX
```

### 설치 방법
1. Diawi 링크를 Safari에서 열기 (iPhone)
2. **Install** 버튼 탭
3. 설정 > 일반 > VPN 및 기기 관리 > 신뢰

---

## 🥉 방법 3: Xcode 직접 설치

### 특징
- ⚡ 가장 빠름 (즉시 설치)
- 🔌 Mac과 iPhone 연결 필요 (USB 또는 WiFi)
- 🖱️ 매번 수동 작업 필요
- 👤 단일 기기 테스트에 적합

### 사전 준비
```bash
# 1. Development 프로필로 빌드
eas build --platform ios --profile development --local

# 2. Xcode 설치
# https://apps.apple.com/app/xcode/id497799835
```

### 설치 방법

#### USB 연결
```bash
# 1. iPhone을 Mac에 USB로 연결
# 2. Xcode 실행
# 3. Window > Devices and Simulators (⇧⌘2)
# 4. 왼쪽에서 연결된 iPhone 선택
# 5. "Installed Apps" 섹션에서 + 버튼 클릭
# 6. 빌드한 .ipa 파일 선택
```

#### WiFi 연결 (같은 네트워크 내)
```bash
# 1. 최초 1회 USB 연결 후 Xcode에서 설정
#    Devices and Simulators > 기기 선택 > "Connect via network" 체크
# 2. 이후부터는 WiFi로 자동 연결됨
```

---

## 🚀 방법 4: 완전 자동화 워크플로우

매번 빌드할 때마다 자동으로 TestFlight에 업로드:

### GitHub Actions 워크플로우 생성

```yaml
# .github/workflows/ios-build.yml
name: iOS Build & Deploy

on:
  push:
    branches: [main, deploy]
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g eas-cli

      - name: Build iOS
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
        run: |
          eas build --platform ios --profile production --local --non-interactive

      - name: Submit to TestFlight
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
          ASC_API_KEY_ID: ${{ secrets.ASC_API_KEY_ID }}
          ASC_API_ISSUER_ID: ${{ secrets.ASC_API_ISSUER_ID }}
        run: |
          eas submit --platform ios --profile production --latest --non-interactive
```

### GitHub Secrets 설정
```bash
# Repository > Settings > Secrets and variables > Actions

# 필요한 Secrets:
- EXPO_TOKEN: eas whoami --json 에서 확인
- ASC_API_KEY_ID: Apple Developer 계정
- ASC_API_ISSUER_ID: Apple Developer 계정
```

---

## 📋 UDID 등록 (Ad Hoc 빌드용)

Diawi나 Ad Hoc 배포를 위해서는 테스터 기기의 UDID를 등록해야 합니다.

### UDID 확인 방법

#### 방법 1: 설정 앱
```bash
# iPhone에서:
# 설정 > 일반 > 정보 > 이름 탭
# (UDID가 표시됨, 길게 눌러서 복사)
```

#### 방법 2: Xcode
```bash
# 1. iPhone을 Mac에 연결
# 2. Xcode > Window > Devices and Simulators
# 3. 기기 선택 > Identifier 복사
```

#### 방법 3: 웹사이트
```bash
# https://udid.tech/
# Safari로 접속 > Install Profile > UDID 자동 표시
```

### Apple Developer에 UDID 등록
```bash
# 1. https://developer.apple.com/account/resources/devices/list
# 2. "+" 버튼 클릭
# 3. Platform: iOS/iPadOS
# 4. Device Name: 테스터 이름
# 5. Device ID (UDID): 복사한 UDID 입력
# 6. Continue > Register
```

---

## 🔧 문제 해결

### TestFlight 업로드 실패
```bash
# AuthKey.p8 파일 확인
ls -la AuthKey.p8

# 환경변수 확인
echo $ASC_API_KEY_ID
echo $ASC_API_ISSUER_ID

# EAS 로그인 재시도
eas logout
eas login
```

### Diawi 업로드 실패
```bash
# API 토큰 확인
echo $DIAWI_API_TOKEN

# IPA 파일 크기 확인 (최대 500MB)
ls -lh build-*.ipa

# Ad Hoc 프로비저닝 확인
# Apple Developer > Certificates > Provisioning Profiles
```

### 설치 후 "신뢰할 수 없는 개발자" 오류
```bash
# iPhone에서:
# 설정 > 일반 > VPN 및 기기 관리
# 개발자 앱 섹션에서 앱 선택 > 신뢰 버튼 탭
```

---

## 📊 비용 비교

| 서비스 | 비용 | 제한사항 |
|--------|------|----------|
| **TestFlight** | 무료 | Apple Developer 계정 필요 ($99/년) |
| **Diawi 무료** | 무료 | 7일 후 삭제, 20회/월 업로드 |
| **Diawi Pro** | $12/월 | 무제한 보관, 무제한 업로드 |
| **App Store** | 무료 | Apple Developer 계정 필요 |

---

## 🎓 권장 워크플로우

### 스타트업 초기 (PMF 찾기 단계)
```bash
# 빠른 반복을 위해 Diawi 사용
./scripts/build.sh
# → iOS → Production → Diawi
# → 링크 공유로 즉시 테스트
```

### 안정화 단계 (베타 테스트)
```bash
# TestFlight로 정식 배포
./scripts/build.sh
# → iOS → Production → TestFlight
# → 외부 테스터 초대
```

### 정식 출시
```bash
# App Store Connect에서 수동 제출
# 1. TestFlight 빌드 선택
# 2. "Submit for Review" 클릭
# 3. 심사 대기 (1-3일)
```

---

## 📱 추천 방법 요약

**당신에게 맞는 방법:**

- 🏃 **빠른 테스트가 필요하다**: Diawi
- 👥 **여러 사람과 공유해야 한다**: TestFlight
- 🔨 **혼자 개발 중이다**: Xcode 직접 설치
- 🚀 **자동화하고 싶다**: GitHub Actions + TestFlight

---

**Happy Testing! 🎉**
