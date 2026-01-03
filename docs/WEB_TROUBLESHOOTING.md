# 웹 개발 중 발생하는 오류 해결 가이드

## 🐛 "Requiring unknown module" 오류

### 증상
```
Uncaught Error: Requiring unknown module "729"
Uncaught SyntaxError: Unexpected token '<'
```

### 원인
1. **Metro Bundler 캐시 손상**: 모듈 번호 매핑이 실제 코드와 불일치
2. **Hot Module Replacement(HMR) 버그**: 개발 중 파일 변경 시 모듈 그래프 깨짐
3. **Service Worker 캐싱**: 브라우저가 오래된 번들 파일을 캐싱

---

## 🔧 해결 방법 (단계별)

### 1단계: 브라우저 캐시 클리어 (가장 빠름)

**권장 방법**: Hard Reload
```
- Chrome/Edge: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
- Safari: Cmd+Option+R
```

**또는 개발자 도구 사용**:
1. 개발자 도구 열기 (F12)
2. Network 탭 열기
3. "Disable cache" 체크박스 활성화
4. 페이지 새로고침

**Service Worker 삭제**:
1. 개발자 도구 → Application 탭
2. Service Workers 섹션
3. "Unregister" 클릭
4. 페이지 새로고침

---

### 2단계: Metro Cache 클리어

**방법 A**: npm script 사용 (권장)
```bash
npm run web:clear
```

**방법 B**: 수동 캐시 클리어
```bash
# .expo 디렉터리 삭제
rm -rf .expo

# Metro cache 삭제
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# 웹 서버 재시작
npm run web
```

**방법 C**: Expo CLI 옵션 사용
```bash
npx expo start --web --clear
```

---

### 3단계: 전체 캐시 클리어 (강력)

**빠른 실행**:
```bash
npm run web:restart
```

**완전 초기화** (node_modules 포함):
```bash
npm run cache:clear:hard
npm install
npm run web
```

---

### 4단계: Watchman 캐시 클리어 (Mac 사용자)

Watchman이 설치되어 있다면:
```bash
watchman watch-del-all
```

---

## 🚀 개발 워크플로우 권장사항

### 정상 개발 시작
```bash
npm run web
```

### 오류 발생 시
```bash
# 1. 브라우저 Hard Reload (Cmd+Shift+R)
# 2. 그래도 안 되면:
npm run web:restart
```

### 오류가 계속 발생할 때
```bash
# 전체 캐시 클리어
npm run cache:clear
npm install
npm run web
```

---

## 🔍 오류 유형별 해결법

### "Unexpected token '<'" 오류
- **원인**: JavaScript 파일 대신 HTML 파일이 로드됨 (404 에러)
- **해결**: Metro cache 클리어 + Hard Reload

### "Extension context invalidated" 오류
- **원인**: 브라우저 확장 프로그램 문제 (무시 가능)
- **해결**: 브라우저 확장 프로그램 비활성화 또는 시크릿 모드 사용

### Module Resolution 오류
- **원인**: Metro bundler가 모듈을 찾지 못함
- **해결**:
  1. `npm install` 재실행
  2. node_modules 삭제 후 재설치
  3. tsconfig.json 경로 확인

---

## 💡 예방 팁

### 1. Metro Cache 자주 클리어
개발 중 이상한 오류가 발생하면 습관적으로:
```bash
npm run web:clear
```

### 2. 브라우저 캐시 비활성화
개발자 도구 → Network 탭 → "Disable cache" 항상 켜두기

### 3. 정기적인 의존성 업데이트
```bash
# 의존성 확인
npm outdated

# 업데이트
npm update
```

### 4. Git 변경 사항 확인
다른 브랜치로 전환 후 오류가 발생한다면:
```bash
# node_modules 재설치
rm -rf node_modules
npm install
```

---

## 🛠️ 디버깅 팁

### Metro Bundler 로그 확인
터미널에서 Metro bundler 로그를 주의깊게 관찰:
- 빨간색 오류 메시지
- 경고 메시지
- 번들링 진행 상황

### 브라우저 콘솔 확인
1. 개발자 도구 열기 (F12)
2. Console 탭에서 오류 스택 트레이스 확인
3. Network 탭에서 실패한 요청 확인

### React DevTools 사용
- 컴포넌트 트리 확인
- Props/State 디버깅
- Profiler로 성능 분석

---

## 📚 관련 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `npm run web` | 웹 개발 서버 시작 |
| `npm run web:clear` | 캐시 클리어 후 시작 |
| `npm run web:restart` | 프로세스 종료 후 재시작 |
| `npm run cache:clear` | 전체 캐시 클리어 |
| `npm run cache:clear:hard` | node_modules 포함 클리어 |

---

## 🆘 그래도 해결되지 않는다면

1. **프로젝트 재시작**
   ```bash
   # 모든 프로세스 종료
   lsof -ti:3000 | xargs kill -9

   # 완전 초기화
   npm run cache:clear:hard
   npm install
   npm run web
   ```

2. **이슈 보고**
   - 오류 메시지 스크린샷
   - 재현 단계
   - 환경 정보 (Node 버전, OS 등)

3. **임시 회피**
   - 다른 포트 사용: `npx expo start --web --port 3001`
   - 다른 브라우저 시도
   - 시크릿 모드 사용
