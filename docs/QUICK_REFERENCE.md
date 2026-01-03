# 🚀 Sometimes App - 빠른 참조 가이드

## 📱 어떤 빌드를 사용해야 하나요?

| 목적 | 사용할 빌드 | 설치 방법 |
|------|------------|-----------|
| **USB로 iPhone에 직접 설치** | `preview` | USB 케이블 |
| **TestFlight 배포** | `production` | TestFlight |
| **App Store 출시** | `production` | App Store Connect |
| **개발 중 빠른 테스트** | `development` | Expo Go 또는 USB |

---

## 🎯 시나리오별 명령어

### 시나리오 1: 빠르게 내 iPhone에서 테스트하고 싶어요

```bash
# 1. Preview 빌드 생성
npm run build:ios:preview

# 2. iPhone 연결 (USB)

# 3. 설치
npm run install:latest
```

### 시나리오 2: TestFlight으로 팀원들과 테스트하고 싶어요

```bash
# 1. Production 빌드 생성
npm run build:ios

# 2. TestFlight 제출
npm run submit:testflight

# 3. TestFlight 앱에서 확인
```

### 시나리오 3: App Store에 출시하고 싶어요

```bash
# 1. Production 빌드 생성
npm run build:ios

# 2. TestFlight 제출
npm run submit:testflight

# 3. App Store Connect에서 심사 제출
open https://appstoreconnect.apple.com
```

### 시나리오 4: 개발 중 빠른 반복 테스트

```bash
# 방법 1: Expo Go (가장 빠름)
npm start

# 방법 2: Development 빌드
npm run build:ios:dev
npm run install:latest
```

---

## 🔑 빌드 프로필 차이점

### 🟢 Development
- **용도**: 개발 중 로컬 테스트
- **프로비저닝**: Development
- **USB 설치**: ✅ 가능
- **TestFlight**: ❌ 불가능
- **특징**: Expo Go와 유사, 디버깅 용이

### 🟡 Preview
- **용도**: 내부 테스트 (실제 기기)
- **프로비저닝**: Ad-hoc
- **USB 설치**: ✅ 가능
- **TestFlight**: ✅ 가능 (선택)
- **특징**: Production과 유사한 환경

### 🔴 Production
- **용도**: 스토어 출시, TestFlight 배포
- **프로비저닝**: App Store Distribution
- **USB 설치**: ❌ **불가능**
- **TestFlight**: ✅ 필수
- **특징**: 최종 배포용, 코드 서명 엄격

---

## ⚠️ 주의사항

### Production 빌드로 USB 설치 시도 시 에러

```
ERROR: Attempted to install a Beta profile without the proper entitlement.
무결성을 확인할 수 없기 때문에 이 앱을 설치할 수 없습니다.
```

**해결:**
```bash
# Preview 빌드로 다시 빌드
npm run build:ios:preview
npm run install:latest
```

### TestFlight 제출 실패

```
Error: "ascApiKeyId" is not allowed to be empty
```

**해결:**
1. App Store Connect API 키 생성
2. `.env.production` 설정
3. `AuthKey.p8` 파일 배치

**자세한 가이드**: [TESTFLIGHT_SETUP.md](./TESTFLIGHT_SETUP.md)

---

## 📊 명령어 치트시트

```bash
# === 빌드 ===
npm run build                    # 대화형 빌드
npm run build:ios                # iOS Production
npm run build:ios:preview        # iOS Preview (USB 설치용)
npm run build:ios:dev            # iOS Development
npm run build:android            # Android Production

# === 설치 ===
npm run install:latest           # 최신 빌드 iPhone 설치
npm run install:device           # 기존 설치 스크립트

# === 배포 ===
npm run submit:testflight        # TestFlight 제출

# === 개발 ===
npm start                        # Expo 개발 서버
npm run ios                      # iOS 시뮬레이터
npm run android                  # Android 에뮬레이터
```

---

## 🔗 관련 문서

- [빌드 & 배포 전체 가이드](./BUILD_AND_DEPLOY.md)
- [TestFlight 설정](./TESTFLIGHT_SETUP.md)
- [프로젝트 README](../README.md)

---

## 💡 팁

### 빌드 시간 단축
- 개발 중에는 `npm start` (Expo Go) 사용
- 빌드는 필요할 때만 (1-2일에 한 번)

### 효율적인 테스트
1. **개발**: Expo Go
2. **기능 확인**: Preview 빌드 → USB 설치
3. **팀 공유**: Production → TestFlight

### 빌드 파일 관리
```bash
# 오래된 빌드 삭제 (1주일 이상)
find builds/ -type f -mtime +7 -delete

# 디스크 공간 확인
du -sh builds/
```
