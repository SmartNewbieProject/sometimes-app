# 회원가입 자동 로그인 API 명세

## 배경 및 목적

### 현재 문제점
- 회원가입 완료 후 사용자가 수동으로 로그인해야 함
- 불필요한 단계로 인한 사용자 이탈 가능성
- 승인 대기 화면을 거쳐야 하는 복잡한 흐름

### 개선 방향
- 회원가입 완료 즉시 토큰 발급 및 자동 로그인
- 미승인 상태로 바로 앱 진입
- 매칭 타이머 화면에서 승인 대기 안내 표시

---

## 1. 회원가입 API 변경사항

### 엔드포인트
```
POST /auth/signup
```

### 기존 응답 (AS-IS)
```typescript
// Response: 204 No Content 또는 빈 응답
void
```

### 변경된 응답 (TO-BE)
```typescript
interface SignupResponse {
  accessToken: string;      // JWT 액세스 토큰
  refreshToken: string;     // JWT 리프레시 토큰
  userId: string;           // 사용자 고유 ID
}
```

### 응답 예시
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "123456"
}
```

---

## 2. 비즈니스 로직 요구사항

### 2.1 회원가입 시 토큰 발급
- 회원가입 성공 시 즉시 JWT 토큰 생성
- `accessToken`, `refreshToken` 모두 발급
- 사용자 ID 포함

### 2.2 초기 승인 상태
- 신규 가입 사용자의 `isApproved` 필드는 `false`로 설정
- 토큰은 발급되지만 매칭 기능은 제한됨

### 2.3 토큰 유효성
- 발급된 토큰은 일반 로그인 토큰과 동일하게 작동
- 토큰만으로 API 인증 가능
- Refresh Token으로 Access Token 갱신 가능

---

## 3. 프론트엔드 흐름

### 3.1 회원가입 완료 후
```typescript
// 1. 회원가입 API 호출
const response = await POST('/auth/signup', formData);

// 2. 토큰 저장
await storage.set('access-token', response.accessToken);
await storage.set('refresh-token', response.refreshToken);

// 3. Mixpanel 사용자 식별
mixpanel.identify(response.userId);

// 4. 푸시 알림 등록
await registerForPushNotifications();

// 5. 홈 화면으로 이동
router.replace('/(tabs)/');
```

### 3.2 미승인 사용자의 앱 이용
- ✅ **가능**: 내 성향 입력, 파트너 성향 입력, 매칭 타이머 보기
- ✅ **가능**: 스케줄 매칭, 재매칭, 결제 UI 접근
- ✅ **가능**: 모먼트 보기/작성, 썸메이트 이용
- ❌ **불가**: 실제 매칭 진행, 커뮤니티 글쓰기, 내 프로필 상세 접근

### 3.3 승인 완료 후
- 관리자가 프로필 승인 처리 (`isApproved: true`)
- 사용자에게 푸시 알림 발송
- 다음 매칭부터 정상 매칭 큐에 포함

---

## 4. 보안 고려사항

### 4.1 토큰 보안
- 토큰은 HTTPS를 통해서만 전송
- Refresh Token은 보안 저장소에 저장 (iOS: Keychain, Android: KeyStore)
- Access Token 만료 시간: 1시간 (기존과 동일)
- Refresh Token 만료 시간: 30일 (기존과 동일)

### 4.2 중복 가입 방지
- 전화번호 중복 체크 로직 유지
- 이미 가입된 사용자는 회원가입 API 호출 전에 차단

---

## 5. 에러 처리

### 5.1 회원가입 실패
```json
{
  "statusCode": 400,
  "message": "이미 가입된 전화번호입니다",
  "error": "Bad Request"
}
```

### 5.2 토큰 발급 실패
- 회원가입은 성공했지만 토큰 발급 실패 시:
  - 에러 응답 반환
  - 프론트엔드에서 기존 플로우(로그인 화면)로 fallback

---

## 6. 마이그레이션 전략

### 6.1 하위 호환성
- 기존 클라이언트도 정상 작동하도록 보장
- 토큰이 응답에 없으면 기존 플로우(로그인 화면) 사용

### 6.2 배포 순서
1. **백엔드**: 회원가입 API 응답에 토큰 추가
2. **프론트엔드**: 토큰 처리 로직 추가 및 배포
3. **모니터링**: 자동 로그인 성공률 추적

---

## 7. 테스트 시나리오

### 시나리오 1: 신규 가입 자동 로그인
1. 회원가입 진행
2. 프로필 이미지 등록
3. 회원가입 완료
4. **기대 결과**:
   - 토큰 발급 성공
   - 자동 로그인 완료
   - 홈 화면 진입
   - 매칭 타이머에 "승인 대기" UI 표시

### 시나리오 2: 미승인 유저 매칭 시도
1. 자동 로그인 완료 후 홈 화면 진입
2. 내 성향, 파트너 성향 입력 완료
3. 매칭 타이머 확인
4. **기대 결과**:
   - `type: 'pending-approval'` 응답
   - 타이머 + 승인 대기 안내 카드 표시
   - 실제 매칭은 진행되지 않음

### 시나리오 3: 승인 완료 후 매칭
1. 관리자가 프로필 승인 처리
2. 사용자가 앱 재실행 또는 폴링으로 상태 확인
3. **기대 결과**:
   - 매칭 타이머에서 정상 매칭 UI 표시
   - 다음 매칭 시간에 매칭 큐 포함

### 시나리오 4: 토큰 발급 실패 (Fallback)
1. 회원가입 완료
2. 토큰 발급 실패
3. **기대 결과**:
   - 에러 처리
   - 기존 플로우(로그인 화면)로 이동
   - 사용자는 수동 로그인

---

## 8. 관련 API

### 8.1 기존 API (변경 없음)
```
POST /auth/login          # 일반 로그인
POST /auth/logout         # 로그아웃
POST /auth/refresh        # 토큰 갱신
```

### 8.2 매칭 API (기존 명세 참조)
```
GET /api/v2/matching      # 미승인 유저는 type: 'pending-approval' 응답
```

---

## 9. KPI 및 모니터링

### 9.1 추적 이벤트
- `Signup_Completed`: 회원가입 완료
- `Auto_Login_Success`: 자동 로그인 성공
- `Auto_Login_Failed`: 자동 로그인 실패 (fallback)

### 9.2 모니터링 지표
- 회원가입 → 자동 로그인 성공률
- 자동 로그인 후 홈 화면 도달률
- 토큰 발급 실패율

---

## 10. 참고 문서

- [매칭 API v2 명세](./backend-matching-api-v2-spec.md)
- [프론트엔드 구현 요약](./frontend-implementation-summary.md)

---

## 문서 버전
- **작성일**: 2025-12-14
- **작성자**: Frontend Team
- **버전**: 1.0
- **상태**: Draft - 백엔드 검토 요청

---

## 변경 이력
| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 2025-12-14 | 1.0 | 초안 작성 | Frontend |
