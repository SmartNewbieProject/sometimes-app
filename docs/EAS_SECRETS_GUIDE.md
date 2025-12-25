# EAS Secrets 설정 가이드

## 🔐 보안 구성

### 안전한 파일 (GitHub에 커밋 가능)
- ✅ `eas.json` - 환경 변수를 `${VARIABLE_NAME}` 형식으로 참조
- ✅ `app.config.ts` - 환경 변수를 읽어서 extra에 주입

### 민감한 파일 (.gitignore 등록됨)
- ❌ `.env.production` - 실제 API 키, 결제 키 포함
- ❌ `.env.preview` - 개발 서버 설정
- ❌ `.env` - 로컬 개발 환경

---

## 🚀 초기 설정 (팀원 추가 시)

### 1. EAS Secrets 등록

**한 번만 실행 (팀 리드):**

```bash
./scripts/setup-eas-secrets.sh
```

이 스크립트는:
- `.env.production`의 모든 `EXPO_PUBLIC_*` 변수를 EAS Secrets에 등록
- `.env.preview`의 특정 변수들을 `_PREVIEW` 접미사로 등록

### 2. 등록된 Secrets 확인

```bash
eas secret:list
```

예상 출력:
```
Name                              Created
EXPO_PUBLIC_API_URL               2025-12-23
EXPO_PUBLIC_CHANNEL_KEY           2025-12-23
EXPO_PUBLIC_MERCHANT_ID           2025-12-23
...
```

---

## 🏗️ 빌드 방식

### 로컬 빌드 (개발자 머신)

```bash
./scripts/build.sh
```

- ✅ `.env.production` 파일에서 환경 변수 로드
- ✅ 로컬 파일 기반 (EAS Secrets 불필요)
- ✅ 빠른 테스트 가능

### 클라우드 빌드 (EAS)

```bash
eas build --platform ios --profile production
```

- ✅ EAS Secrets에서 환경 변수 자동 주입
- ✅ GitHub Actions/CI에서 사용 가능
- ✅ 팀원 누구나 빌드 가능 (Secrets는 EAS에 저장됨)

---

## 🔄 환경 변수 업데이트

### 값 변경 시

```bash
# EAS Secret 업데이트
eas secret:create --name EXPO_PUBLIC_API_URL --value "새값" --force

# 또는 전체 재등록
./scripts/setup-eas-secrets.sh
```

### 로컬 빌드는?

- `.env.production` 파일만 수정
- EAS Secrets 업데이트 불필요 (로컬은 파일 읽음)

---

## 🆕 새 팀원 온보딩

### 클라우드 빌드만 사용하는 경우

1. EAS 로그인
   ```bash
   eas login
   ```

2. 바로 빌드 가능!
   ```bash
   eas build --platform ios --profile production
   ```

**EAS Secrets는 프로젝트에 등록되어 있으므로 별도 설정 불필요**

### 로컬 빌드도 사용하는 경우

1. 팀 리드에게 `.env.production` 파일 받기 (Slack DM 등)

2. 프로젝트 루트에 저장
   ```bash
   # 받은 파일을 프로젝트 루트에 저장
   cp ~/Downloads/.env.production .
   ```

3. 로컬 빌드 실행
   ```bash
   ./scripts/build.sh
   ```

---

## 🔒 보안 체크리스트

- [ ] `.env.production`이 `.gitignore`에 등록되어 있음
- [ ] `eas.json`에 평문 비밀 값 없음 (모두 `${VARIABLE_NAME}` 형식)
- [ ] EAS Secrets에 모든 `EXPO_PUBLIC_*` 변수 등록됨
- [ ] `.env.production` 파일은 팀 내부에서만 공유 (Slack, 1Password 등)

---

## 🐛 트러블슈팅

### "Secret not found" 에러

```bash
# Secrets 목록 확인
eas secret:list

# 누락된 변수 등록
eas secret:create --name EXPO_PUBLIC_API_URL --value "값"
```

### 클라우드 빌드에서 환경 변수 누락

```bash
# 전체 Secrets 재등록
./scripts/setup-eas-secrets.sh
```

### 로컬 빌드 실패

```bash
# .env.production 파일 확인
cat .env.production | grep EXPO_PUBLIC_API_URL

# 없으면 팀 리드에게 파일 요청
```

---

## 📚 참고

- [EAS Secrets 공식 문서](https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables)
- [Expo Config 환경 변수](https://docs.expo.dev/guides/environment-variables/)
