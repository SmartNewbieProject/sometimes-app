---
name: agent-browser
description: Headless browser automation for web tasks. Use when user asks to "browse", "open website", "scrape", "fill form", "click button", "screenshot", "test login flow", "automate browser", "웹 자동화", "브라우저 열어줘", "사이트 확인해줘", "스크린샷 찍어줘", "폼 입력", "로그인 테스트"
---

# Agent Browser - Browser Automation Skill

Headless 브라우저(Chromium)를 제어하여 웹 페이지 조작, 데이터 추출, 폼 입력, 스크린샷 등 브라우저 기반 업무를 자동 수행합니다.

---

## 실행 환경

- **CLI**: `npx agent-browser <command>`
- **브라우저**: Chromium (headless, `--headed` 옵션으로 visible 전환 가능)
- **세션**: 데몬 기반 — 명령어 간 브라우저 상태 유지

---

## 핵심 워크플로우 (Snapshot-Ref 패턴)

모든 브라우저 조작은 이 3단계를 반복합니다:

### Step 1: 페이지 열기
```bash
npx agent-browser open <url>
```

### Step 2: Snapshot으로 요소 탐색
```bash
npx agent-browser snapshot -i
```
`-i` = interactive 요소만 (버튼, 입력창, 링크 등)

출력 예시:
```
- heading "Example Domain" [ref=e1] [level=1]
- textbox "Email" [ref=e2]
- textbox "Password" [ref=e3]
- button "Sign In" [ref=e4]
- link "Forgot password?" [ref=e5]
```

### Step 3: Ref로 조작
```bash
npx agent-browser fill @e2 "user@example.com"
npx agent-browser fill @e3 "password123"
npx agent-browser click @e4
```

### Step 4: 페이지 변경 후 재탐색
```bash
npx agent-browser snapshot -i   # 새 상태의 ref 확인
```

> **중요**: 페이지가 변경되면 기존 ref는 무효화됩니다. 반드시 재snapshot 후 새 ref를 사용하세요.

---

## 명령어 레퍼런스

### 네비게이션
```bash
npx agent-browser open <url>              # 페이지 열기
npx agent-browser open <url> --headed     # 브라우저 창 표시 (디버깅용)
npx agent-browser back                    # 뒤로가기
npx agent-browser forward                 # 앞으로가기
npx agent-browser reload                  # 새로고침
```

### 요소 조작
```bash
npx agent-browser click @e1               # 클릭
npx agent-browser dblclick @e1            # 더블클릭
npx agent-browser fill @e2 "text"         # 입력창 비우고 입력
npx agent-browser type @e2 "text"         # 기존 텍스트 뒤에 추가 입력
npx agent-browser select @e3 "option"     # 드롭다운 선택
npx agent-browser check @e4              # 체크박스 체크
npx agent-browser uncheck @e4            # 체크박스 해제
npx agent-browser hover @e5              # 마우스 호버
npx agent-browser focus @e6              # 포커스
npx agent-browser press Enter             # 키보드 입력 (Enter, Tab, Escape 등)
npx agent-browser press Control+a         # 키 조합
npx agent-browser scroll down 500         # 스크롤 (up/down/left/right)
npx agent-browser scrollintoview @e7      # 요소까지 스크롤
npx agent-browser upload @e8 /path/file   # 파일 업로드
```

### Snapshot & 정보 조회
```bash
npx agent-browser snapshot                # 전체 접근성 트리
npx agent-browser snapshot -i             # interactive 요소만 (권장)
npx agent-browser snapshot -i -c          # compact (빈 구조 제거)
npx agent-browser snapshot -i -d 3        # 깊이 제한
npx agent-browser snapshot -s "#main"     # 특정 CSS 선택자 범위
npx agent-browser snapshot -i -C          # cursor-interactive 포함 (onclick div 등)

npx agent-browser get text @e1            # 텍스트 가져오기
npx agent-browser get html @e1            # innerHTML
npx agent-browser get value @e1           # input 값
npx agent-browser get attr @e1 href       # 속성 값
npx agent-browser get title               # 페이지 제목
npx agent-browser get url                 # 현재 URL
npx agent-browser get count ".item"       # 매칭 요소 개수
```

### 스크린샷 & PDF
```bash
npx agent-browser screenshot              # 현재 화면 (임시 경로)
npx agent-browser screenshot page.png     # 지정 경로에 저장
npx agent-browser screenshot --full       # 전체 페이지 캡처
npx agent-browser pdf output.pdf          # PDF 저장
```

### 대기 (Wait)
```bash
npx agent-browser wait "#element"         # 요소가 보일 때까지
npx agent-browser wait 2000               # 2초 대기
npx agent-browser wait --text "Welcome"   # 특정 텍스트 등장 대기
npx agent-browser wait --url "**/dashboard" # URL 변경 대기
npx agent-browser wait --load networkidle # 네트워크 안정화 대기
npx agent-browser wait --fn "window.ready === true" # JS 조건 대기
```

### JavaScript 실행
```bash
npx agent-browser eval "document.title"
npx agent-browser eval "document.querySelectorAll('.item').length"
npx agent-browser eval "localStorage.getItem('token')"
```

### 시맨틱 로케이터 (CSS 선택자 대신)
```bash
npx agent-browser find role button click --name "Submit"
npx agent-browser find text "Sign In" click
npx agent-browser find label "Email" fill "test@test.com"
npx agent-browser find placeholder "Search..." fill "query"
npx agent-browser find testid "login-btn" click
```

### 탭 관리
```bash
npx agent-browser tab                     # 탭 목록
npx agent-browser tab new https://...     # 새 탭
npx agent-browser tab 2                   # 탭 전환
npx agent-browser tab close               # 현재 탭 닫기
```

### 쿠키 & 스토리지
```bash
npx agent-browser cookies                 # 모든 쿠키 조회
npx agent-browser cookies set name value  # 쿠키 설정
npx agent-browser cookies clear           # 쿠키 삭제
npx agent-browser storage local           # localStorage 전체
npx agent-browser storage local token     # 특정 키
npx agent-browser storage local set key val # 값 설정
```

### 네트워크 가로채기
```bash
npx agent-browser network route "*/api/*"              # 요청 인터셉트
npx agent-browser network route "*/ads/*" --abort      # 요청 차단
npx agent-browser network route "*/data" --body '{"mock":true}' # Mock
npx agent-browser network requests                     # 추적된 요청 보기
npx agent-browser network requests --filter api        # 필터링
```

### 디바이스 에뮬레이션
```bash
npx agent-browser set device "iPhone 14"
npx agent-browser set viewport 390 844    # 커스텀 뷰포트
npx agent-browser set media dark          # 다크 모드
npx agent-browser set geo 37.5665 126.9780 # 위치 (서울)
```

### 디버깅
```bash
npx agent-browser console                 # 콘솔 메시지
npx agent-browser errors                  # JS 에러
npx agent-browser highlight @e1           # 요소 하이라이트
npx agent-browser trace start             # 트레이스 시작
npx agent-browser trace stop trace.zip    # 트레이스 저장
```

### 세션 & 브라우저 종료
```bash
npx agent-browser close                   # 브라우저 종료

# 세션 분리 (동시에 여러 브라우저)
npx agent-browser --session s1 open site-a.com
npx agent-browser --session s2 open site-b.com
npx agent-browser session list
```

---

## 명령어 체이닝

독립적인 명령은 `&&`로 체이닝하여 효율적으로 실행합니다:

```bash
# 열고 → 안정화 대기 → snapshot
npx agent-browser open https://example.com && npx agent-browser wait --load networkidle && npx agent-browser snapshot -i

# 폼 입력 체이닝
npx agent-browser fill @e1 "user@test.com" && npx agent-browser fill @e2 "pass" && npx agent-browser click @e3
```

> snapshot 결과를 파싱해서 ref를 알아야 하는 경우에는 체이닝하지 말고 분리 실행합니다.

---

## 자주 쓰는 작업 패턴

### 로그인 테스트
```bash
npx agent-browser open https://app.example.com/login
npx agent-browser snapshot -i
# → ref 확인 후
npx agent-browser fill @e1 "user@email.com" && npx agent-browser fill @e2 "password"
npx agent-browser click @e3
npx agent-browser wait --load networkidle
npx agent-browser screenshot login-result.png
npx agent-browser get url   # 리다이렉트 확인
```

### 페이지 데이터 스크래핑
```bash
npx agent-browser open https://example.com/products
npx agent-browser wait --load networkidle
npx agent-browser snapshot -c
npx agent-browser eval "JSON.stringify([...document.querySelectorAll('.product')].map(el => ({name: el.querySelector('h2').textContent, price: el.querySelector('.price').textContent})))"
```

### 폼 자동 입력
```bash
npx agent-browser open https://example.com/signup
npx agent-browser snapshot -i
# → ref 확인 후 순서대로 입력
npx agent-browser fill @e1 "이름"
npx agent-browser fill @e2 "email@test.com"
npx agent-browser select @e3 "option-value"
npx agent-browser check @e4
npx agent-browser click @e5  # 제출
```

### 모바일 뷰 테스트
```bash
npx agent-browser set device "iPhone 14"
npx agent-browser open https://example.com
npx agent-browser wait --load networkidle
npx agent-browser screenshot mobile-view.png --full
```

### 스크린샷 비교 (Before/After)
```bash
npx agent-browser open https://example.com
npx agent-browser screenshot before.png
# ... 조작 수행 ...
npx agent-browser screenshot after.png
```

### 인증 헤더로 API 접근
```bash
npx agent-browser open https://api.example.com --headers '{"Authorization": "Bearer <token>"}'
npx agent-browser snapshot -i
```

### 네트워크 요청 모니터링
```bash
npx agent-browser open https://example.com
npx agent-browser network requests --filter api
```

---

## Snapshot 옵션 가이드

| 옵션 | 설명 | 사용 시점 |
|------|------|----------|
| `-i` | interactive 요소만 | 일반적인 조작 (권장 기본값) |
| `-C` | cursor-interactive 포함 | SPA에서 div onclick 등 감지 |
| `-c` | compact (빈 구조 제거) | 출력이 너무 길 때 |
| `-d N` | 깊이 제한 | 복잡한 DOM 탐색 시 |
| `-s "selector"` | 범위 제한 | 특정 영역만 탐색 |
| `--json` | JSON 출력 | 프로그래밍적 파싱 |

조합 예시: `npx agent-browser snapshot -i -c -d 5`

---

## 오류 대응

### 요소를 찾을 수 없을 때
1. `snapshot -i` 대신 `snapshot` (전체 트리)로 확인
2. `-C` 플래그 추가 (cursor-interactive)
3. `wait "#selector"` 로 요소 로딩 대기
4. `scroll down 500` 후 재 snapshot

### 페이지 로딩이 느릴 때
```bash
npx agent-browser wait --load networkidle
npx agent-browser wait --text "Expected Text"
npx agent-browser wait 3000   # 명시적 대기
```

### ref가 작동하지 않을 때
- 페이지 변경 후 ref가 무효화됨 → 재 snapshot 필수
- snapshot과 조작 사이에 페이지가 변경되지 않았는지 확인

### Alert/Dialog 방지
- `eval` 로 `window.alert = () => {}` 오버라이드
- confirm 다이얼로그 트리거 요소 클릭 전 확인

---

## 주의사항

1. **ref는 snapshot 직후에만 유효** — 페이지가 바뀌면 반드시 재 snapshot
2. **체이닝 vs 분리 실행** — ref가 필요한 조작은 snapshot 후 분리 실행
3. **timeout** — 기본 30초, 긴 작업은 `wait` 명령어로 명시적 대기
4. **보안** — 비밀번호, 토큰 등 민감 정보는 사용자 확인 후 사용
5. **세션 정리** — 작업 완료 후 `npx agent-browser close` 로 브라우저 종료
6. **headed 모드** — 디버깅 시 `--headed` 옵션으로 브라우저 창 확인 가능

---

## 시작 프로토콜

브라우저 자동화 요청을 받으면:

1. **목표 확인**: 어떤 URL에서 어떤 작업을 수행할지 확인
2. **페이지 열기**: `open <url>` 후 `wait --load networkidle`
3. **요소 탐색**: `snapshot -i` 로 조작 가능한 요소 파악
4. **조작 수행**: ref 기반으로 클릭, 입력, 선택 등 수행
5. **결과 확인**: screenshot 또는 `get text/url` 로 결과 검증
6. **정리**: 작업 완료 후 `close`
