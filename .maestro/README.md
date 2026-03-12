# Maestro E2E

Sometimes 앱의 주요 화면 스모크 테스트를 위한 Maestro 구성입니다.

## 현재 범위

- 로그인 화면 렌더링
- DEV 로그인 기반 홈 진입
- 홈 핵심 CTA 노출
- 홈 -> 알림 화면 이동
- 홈 -> 젬 스토어 이동

## 전제 조건

1. Maestro CLI 설치
   - macOS/Linux: `curl -Ls "https://get.maestro.mobile.dev" | bash`
   - Windows: [공식 문서](https://maestro.mobile.dev/) 기준 설치
2. Node.js 20 LTS 권장
   - Windows에서 Expo 54 / Metro를 Node 24로 실행하면 번들 단계에서 내부 오류가 발생할 수 있음
   - 로컬 smoke 실행 시 Node 20.20.x 기준으로 맞추는 것을 권장
3. 앱이 이미 기기/에뮬레이터에 설치되어 있어야 함
4. DEV 빌드에서 `DEV 로그인` 버튼이 노출되어야 함

## 앱 ID

- Android 기본값: `com.smartnewb.sometimes`
- iOS 기본값: `com.some-in-univ`

스크립트는 Android 앱 ID를 기본으로 사용합니다. iOS에서 실행할 때는 `MAESTRO_APP_ID=com.some-in-univ` 로 바꿔 실행하면 됩니다.

## 실행

```bash
npm run test:maestro:login
npm run test:maestro:home
npm run test:maestro:navigation
npm run test:maestro:smoke
npm run test:maestro:smoke:dev-client
```

직접 실행 예시:

```bash
cross-env MAESTRO_APP_ID=com.smartnewb.sometimes maestro test .maestro/flows/smoke/smoke.yaml
cross-env MAESTRO_APP_ID=com.smartnewb.sometimes maestro test .maestro/flows/smoke/smoke-dev-client.yaml
cross-env MAESTRO_APP_ID=com.some-in-univ maestro test .maestro/flows/smoke/smoke.yaml
```

`smoke-dev-client.yaml` 은 Expo Dev Client 첫 진입 시 `localhost:8081` 개발 서버 연결 단계를 포함합니다.

## 구조

```text
.maestro/
├─ common/
│  ├─ launch.yaml
│  ├─ connect-dev-server.yaml
│  └─ login-as-dev.yaml
└─ flows/
   └─ smoke/
      ├─ login-screen.yaml
      ├─ home-screen.yaml
      ├─ navigation.yaml
      ├─ smoke-dev-client.yaml
      └─ smoke.yaml
```

## 다음 확장 추천

- 신규 가입자 DEV 계정용 회원가입 플로우 분리
- 빈 상태, 에러 모달, 권한 거부 등 예외 케이스 플로우 추가
- CI에서 Android preview build 설치 후 `test:maestro:smoke` 실행
