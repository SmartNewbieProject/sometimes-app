# Matching API v2 명세 - 승인 대기 상태 지원

## 배경 및 목적

### 현재 문제점
- 회원가입 후 즉시 심사 안내 후 메인 화면 진입
- 미승인 유저의 상태가 명확하게 구분되지 않음
- 미승인 유저에 대한 매칭 제한 로직 부재

### 개선 방향
- 회원가입 후 심사 없이 바로 앱 진입 (단, 일부 기능 제한)
- 미승인 유저는 매칭 타이머만 보이고 실제 매칭은 진행되지 않음
- 승인 대기 중임을 명확히 안내하는 UI 제공

---

## 1. User Profile 변경사항

### UserProfile 타입에 필드 추가

```typescript
interface UserProfile {
  // ... 기존 필드들
  isApproved: boolean;  // 신규 추가: 유저 승인 상태
}
```

### 요구사항
- **필드명**: `isApproved`
- **타입**: `boolean`
- **의미**:
  - `true`: 프로필 심사 완료 및 승인됨 (정상 매칭 가능)
  - `false`: 프로필 심사 대기 중 또는 미승인 (매칭 불가)
- **기본값**: 신규 가입 시 `false`
- **변경 시점**: 관리자가 프로필 심사 완료 후 승인 처리 시 `true`로 변경

---

## 2. Matching API v2 엔드포인트

### 엔드포인트
```
GET /api/v2/matching
```

### 목적
- 기존 `/matching` 엔드포인트의 버전 2
- 유저 승인 상태(`isApproved`)에 따른 매칭 상태 구분
- 미승인 유저에 대한 추가 정보 제공

---

## 3. 응답 구조

### TypeScript 인터페이스

```typescript
interface MatchingResponseV2 {
  id: string | null;                    // 매칭 ID
  type: MatchViewType;                  // 매칭 상태 타입 (신규 타입 포함)
  endOfView: string | null;             // 매칭 종료 시간 (ISO 8601)
  partner: UserProfile | null;          // 매칭된 파트너 정보
  untilNext: string | null;             // 다음 매칭까지 남은 시간
  connectionId: string | null;          // 연결 ID
  approvalStatus?: ApprovalStatus;      // 승인 상태 (미승인 유저만)
  approvalMessage?: string;             // 승인 안내 메시지 (미승인 유저만)
  estimatedApprovalTime?: string;       // 심사 예상 소요 시간 (미승인 유저만)
}

type MatchViewType =
  | 'open'              // 매칭 성공 (파트너 정보 조회 가능)
  | 'waiting'           // 매칭 대기 중
  | 'not-found'         // 매칭 실패
  | 'rematching'        // 재매칭 중
  | 'pending-approval'; // 승인 대기 중 (신규 타입)

type ApprovalStatus =
  | 'pending'           // 심사 대기 중
  | 'approved'          // 승인 완료
  | 'rejected';         // 반려됨
```

---

## 4. 응답 로직

### Case 1: 승인된 유저 (`isApproved: true`)

**기존 로직과 동일하게 처리**

#### 4-1. 매칭 성공
```json
{
  "id": "match-123",
  "type": "open",
  "endOfView": "2025-12-15T14:00:00Z",
  "partner": {
    "id": "user-456",
    "name": "김철수",
    "age": 25,
    "isApproved": true,
    // ... 기타 UserProfile 필드
  },
  "untilNext": null,
  "connectionId": "conn-789"
}
```

#### 4-2. 매칭 대기 중
```json
{
  "id": null,
  "type": "waiting",
  "endOfView": null,
  "partner": null,
  "untilNext": "2025-12-15T10:00:00Z",
  "connectionId": null
}
```

#### 4-3. 매칭 실패
```json
{
  "id": null,
  "type": "not-found",
  "endOfView": null,
  "partner": null,
  "untilNext": "2025-12-16T10:00:00Z",
  "connectionId": null
}
```

---

### Case 2: 미승인 유저 (`isApproved: false`)

**특별 처리 필요**

#### 조건
- 유저의 `isApproved` 필드가 `false`인 경우
- 내 성향, 파트너 성향 입력이 완료된 경우
  - *(성향 완료 여부 판단 로직은 기존과 동일)*

#### 응답 예시

```json
{
  "id": null,
  "type": "pending-approval",
  "endOfView": null,
  "partner": null,
  "untilNext": "2025-12-15T10:00:00Z",
  "connectionId": null,
  "approvalStatus": "pending",
  "approvalMessage": "프로필 심사가 진행 중입니다. 승인 완료 후 매칭이 시작됩니다.",
  "estimatedApprovalTime": "24-48시간"
}
```

#### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | `'pending-approval'` | ✅ | 승인 대기 중 상태를 나타내는 신규 타입 |
| `untilNext` | `string` | ✅ | 다음 매칭 예정 시간 (ISO 8601)<br/>※ 타이머 표시용 (실제 매칭은 진행되지 않음) |
| `approvalStatus` | `'pending'` | ✅ | 현재 승인 상태 (미승인 유저는 항상 `'pending'`) |
| `approvalMessage` | `string` | ⚠️ | 클라이언트에 표시할 안내 메시지<br/>※ 다국어 지원 필요 시 클라이언트에서 처리 가능하도록 메시지 키 전달 고려 |
| `estimatedApprovalTime` | `string` | ⚠️ | 심사 예상 소요 시간 (예: "24-48시간", "1-2일")<br/>※ Optional: 정책에 따라 생략 가능 |

---

## 5. 비즈니스 로직 요구사항

### 5-1. 미승인 유저 매칭 진행 차단

**원칙**: `isApproved: false` 유저는 실제 매칭 큐에 포함되지 않아야 함

- 매칭 알고리즘 실행 시 `isApproved: true` 유저만 대상으로 포함
- 미승인 유저가 매칭 API를 호출해도 `type: 'pending-approval'` 응답만 반환
- 미승인 유저는 매칭 히스토리에도 기록되지 않음

### 5-2. 승인 처리 시 동작

**승인 완료 시나리오**:
1. 관리자가 유저 프로필 심사 후 승인 처리
2. `isApproved` 필드를 `false` → `true`로 변경
3. 다음 매칭 스케줄부터 해당 유저를 매칭 큐에 포함

### 5-3. 다음 매칭 시간 계산

**미승인 유저의 `untilNext` 값**:
- 승인 완료된 유저들이 매칭되는 다음 스케줄 시간을 그대로 반환
- 타이머 UI 표시용으로만 사용 (실제 해당 시간에 매칭되지는 않음)
- 예: 매칭이 매일 오전 10시에 진행된다면, `untilNext`는 다음날 오전 10시

---

## 6. 버전 호환성

### v1 엔드포인트 유지
```
GET /api/v1/matching (또는 /matching)
```
- 기존 클라이언트 호환성을 위해 v1 엔드포인트는 **그대로 유지**
- v1에서는 미승인 유저에게 `type: 'waiting'` 또는 `type: 'not-found'` 반환 (기존 로직)

### v2 도입 시점
- 클라이언트 앱 업데이트와 동시에 v2 사용 시작
- 서버는 두 버전 모두 지원 (점진적 마이그레이션)

---

## 7. 테스트 시나리오

### 시나리오 1: 신규 가입 미승인 유저
1. 회원가입 완료 (`isApproved: false`)
2. 내 성향, 파트너 성향 입력 완료
3. `/api/v2/matching` 호출
4. **기대 결과**: `type: 'pending-approval'` 응답

### 시나리오 2: 승인 완료 후 매칭 대기
1. 관리자가 유저 승인 처리 (`isApproved: true`)
2. 아직 매칭이 진행되지 않은 상태
3. `/api/v2/matching` 호출
4. **기대 결과**: `type: 'waiting'` 응답

### 시나리오 3: 승인 완료 후 매칭 성공
1. 승인된 유저 (`isApproved: true`)
2. 매칭 알고리즘 실행 후 매칭 성공
3. `/api/v2/matching` 호출
4. **기대 결과**: `type: 'open'`, `partner` 정보 포함

### 시나리오 4: 승인된 유저 매칭 실패
1. 승인된 유저 (`isApproved: true`)
2. 매칭 알고리즘 실행 후 매칭 실패
3. `/api/v2/matching` 호출
4. **기대 결과**: `type: 'not-found'`

---

## 8. 에러 처리

### 8-1. 인증 실패
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 8-2. 성향 미입력 유저
- `isApproved: false` 이면서 성향 입력이 완료되지 않은 경우
- **옵션 A**: `type: 'waiting'` 반환 (성향 입력 유도)
- **옵션 B**: 별도 에러 응답
- **권장**: 옵션 A (클라이언트에서 성향 입력 플로우로 유도)

---

## 9. 추가 고려사항

### 9-1. 다국어 지원
- `approvalMessage` 필드를 다국어로 제공할 경우:
  - 서버에서 Accept-Language 헤더 기반으로 메시지 반환
  - 또는 메시지 키만 반환하고 클라이언트에서 번역 처리

### 9-2. 승인 상태 알림
- 승인 완료 시 푸시 알림 발송 (별도 스펙 필요)
- 반려 시 사유와 함께 알림 발송

### 9-3. 승인 소요 시간 통계
- `estimatedApprovalTime` 값을 실제 심사 소요 시간 통계 기반으로 동적 생성 가능
- 초기에는 고정값("24-48시간") 사용 권장

---

## 10. 구현 우선순위

### Phase 1 (필수)
1. ✅ `UserProfile`에 `isApproved` 필드 추가
2. ✅ `/api/v2/matching` 엔드포인트 구현
3. ✅ 미승인 유저 매칭 큐 제외 로직

### Phase 2 (권장)
4. ⚠️ 승인 완료 시 푸시 알림
5. ⚠️ 반려 처리 로직 및 UI 플로우

### Phase 3 (선택)
6. 💡 심사 소요 시간 통계 기반 동적 `estimatedApprovalTime`
7. 💡 승인 상태 변경 이력 관리

---

## 11. 질문 사항

### Q1. 반려(rejected) 케이스 처리
- 프로필이 반려된 경우의 응답 스펙이 필요한가요?
- `approvalStatus: 'rejected'` 시 별도 안내 메시지 필요?

### Q2. 성향 미입력 유저
- `isApproved: false` + 성향 미입력 상태의 응답은 어떻게 처리할까요?
- 현재 스펙에서는 명시되지 않음

### Q3. 승인 처리 API
- 관리자용 승인/반려 API도 함께 작성이 필요한가요?
- 별도 문서로 분리할까요?

---

## 12. 참고 자료

### 기존 엔드포인트
```
GET /matching
```

### 기존 응답 타입
```typescript
type MatchViewType = 'open' | 'waiting' | 'not-found' | 'rematching';
```

### 클라이언트 코드 위치
```
/src/features/idle-match-timer/
  ├── apis/index.tsx          (getLatestMatching)
  ├── queries/use-latest-matching.tsx
  ├── types.ts                (MatchDetails, MatchViewType)
  └── ui/partner.tsx          (Partner 컴포넌트)
```

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
