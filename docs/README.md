# Sometimes App - User Journey Flow 문서

## 문서 개요

| 항목 | 내용 |
|------|------|
| **파일** | `user-journey-flow.json` |
| **버전** | 2.1.0 |
| **최종 수정** | 2025-12-26 |

---

## 작성 목적

### 1. 전체 사용자 경험의 가시화

현재 Sometimes 앱은 40개 이상의 feature 모듈, 10개 도메인에 걸친 복잡한 사용자 흐름을 가지고 있습니다. 이 문서는 **코드에 흩어져 있는 모든 사용자 여정을 하나의 구조화된 JSON으로 통합**하여, 누구나 전체 흐름을 한눈에 파악할 수 있도록 합니다.

### 2. 팀 내 커뮤니케이션 효율화

- **개발자**: 특정 기능의 전후 흐름과 의존성 파악
- **기획자/PM**: 사용자 시나리오 검토 및 개선점 발굴
- **디자이너**: UX 문구와 상태별 메시지 일관성 검토
- **QA**: 테스트 케이스 도출을 위한 플로우 참조

### 3. 외부 전문가 컨설팅 자료

UX 전문가, 그로스 컨설턴트 등 외부 전문가에게 **앱의 현재 상태를 빠르게 전달**하고 인사이트를 얻기 위한 기초 자료로 활용합니다.

---

## 문서 구조

```
user-journey-flow.json
├── entryPoints          # 앱 진입점 및 초기 라우팅
├── domains (10개)       # 도메인별 사용자 여정
│   ├── authentication   # 로그인/회원가입
│   ├── matching         # 매칭 시스템
│   ├── chat             # 채팅
│   ├── profile          # 프로필
│   ├── payment          # 결제/구매
│   └── ...
├── crossDomainFlows     # 도메인 간 연결 흐름
├── modals (41개)        # 모달 다이얼로그 정의
├── toasts (25개)        # 토스트 메시지 정의
├── guards (5개)         # 접근 제어 로직
└── uxCopy               # UX 문구
    ├── validationMessages (35개)
    ├── stateMessages (53개)
    └── onboardingGuide (24개)
```

---

## 주요 인사이트 요청 사항

외부 전문가 검토 시 다음 관점에서 피드백을 요청드립니다:

### UX/UI 관점
- 온보딩 11단계 → 회원가입 5단계 → 관심사 8단계 (총 24단계)의 적정성
- 상태별 메시지(loading/empty/error)의 톤앤매너 일관성
- 모달 사용 빈도와 사용자 피로도

### 그로스 관점
- 회원가입 퍼널에서의 이탈 포인트 예측
- 결제 전환을 높일 수 있는 플로우 개선점
- 재방문율을 높이기 위한 알림/리텐션 전략

### 기술 관점
- 복잡한 가드(guard) 로직의 단순화 가능성
- 도메인 간 의존성 최적화

---

## 활용 방법

### JSON 뷰어로 열기
```bash
# VS Code에서 열기
code docs/user-journey-flow.json

# jq로 특정 섹션 추출
jq '.domains.authentication' docs/user-journey-flow.json
jq '.uxCopy.validationMessages' docs/user-journey-flow.json
```

### 특정 도메인 조회
```bash
# 매칭 도메인만 추출
jq '.domains.matching' docs/user-journey-flow.json

# 모든 모달 목록
jq '.modals | keys' docs/user-journey-flow.json
```

---

## 문서 현황

| 카테고리 | 항목 수 | 상태 |
|---------|--------|------|
| 도메인 | 10개 | 완료 |
| 모달 | 41개 | 완료 |
| 토스트 | 25개 | 완료 |
| 가드 | 5개 | 완료 |
| 유효성 메시지 | 35개 | 완료 |
| 상태 메시지 | 53개 | 완료 |
| 온보딩 가이드 | 24개 | 완료 |
| 버튼/CTA | - | 추가 예정 |
| 푸시 알림 | - | 추가 예정 |
| 입력 필드 | - | 추가 예정 |

---

## 연락처

문서 관련 문의: [담당자 이메일]
