# Maestro E2E 테스트

React Native 앱을 위한 Maestro 테스트 플로우

## 설치

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH":"$HOME/.maestro/bin"
```

## 사전 준비

1. **iOS 시뮬레이터 실행**
   ```bash
   # Expo 앱 실행 (iOS)
   npm start
   # 그 후 'i' 눌러서 iOS 시뮬레이터에서 실행
   ```

2. **Android 에뮬레이터 실행**
   ```bash
   # Expo 앱 실행 (Android)
   npm start
   # 그 후 'a' 눌러서 Android 에뮬레이터에서 실행
   ```

## 테스트 실행

### 개별 플로우 실행

```bash
# 이메일 로그인 테스트
maestro test .maestro/01-email-login.yaml

# 홈 화면 테스트
maestro test .maestro/02-home-screen.yaml
```

### 전체 플로우 실행

```bash
maestro test .maestro
```

## 테스트 플로우

### 01-email-login.yaml
- 로그인 페이지 로드
- 태그라인 long press로 이메일 로그인 모달 열기
- test1@test.com / test1234! 로 로그인
- 홈 화면 진입 확인

### 02-home-screen.yaml
- 로그인 수행 (01-email-login.yaml 재사용)
- 홈 화면 요소 확인
- 새로고침 후 로그인 상태 유지 확인

## 팁

### Maestro Studio로 인터랙티브 테스트
```bash
maestro studio
```

### 스크린샷/비디오 녹화
```bash
maestro test --format junit .maestro
```

### 디버깅
```bash
# 느리게 실행
maestro test --debug-output /tmp/maestro .maestro/01-email-login.yaml

# 각 단계마다 스크린샷
maestro test .maestro/01-email-login.yaml
```

## 문제 해결

### 앱을 찾을 수 없음
- Expo 앱이 시뮬레이터/에뮬레이터에서 실행 중인지 확인
- `appId: host.exp.Exponent`가 올바른지 확인

### 요소를 찾을 수 없음
- Maestro Studio로 실제 화면 요소 확인
- testID를 컴포넌트에 추가하여 정확한 선택 가능

## 참고 자료

- [Maestro 공식 문서](https://maestro.mobile.dev/)
- [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)
