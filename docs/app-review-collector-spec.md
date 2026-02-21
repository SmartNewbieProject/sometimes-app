# App Review Collector - 요구사항 명세

## 개요

iOS App Store와 Google Play Store의 앱 리뷰를 1시간 주기로 수집하여 DynamoDB에 저장하고, 새 리뷰마다 Slack Bot으로 개별 알림을 발송하는 서버리스 시스템.

## 아키텍처

```
EventBridge (1h cron)
    └─▶ Lambda (TypeScript)
            ├─▶ App Store Connect API ─┐
            ├─▶ Google Play API ───────┤
            │                          ▼
            ├─▶ DynamoDB (리뷰 저장, 중복 체크)
            └─▶ Slack Bot API (새 리뷰 알림)

Terraform: Lambda + DynamoDB + EventBridge + IAM + SSM Parameters
```

## 기술 스택

| 구성 요소 | 기술 |
|----------|------|
| 런타임 | AWS Lambda (Node.js 20.x) |
| 언어 | TypeScript (esbuild 번들링) |
| DB | DynamoDB |
| 스케줄러 | EventBridge Rule (1시간 주기) |
| 알림 | Slack Bot (Bot Token) |
| IaC | Terraform |
| 리뷰 소스 | App Store Connect API, Google Play Developer API |

## 기능 요구사항

### 1. 리뷰 수집

- **iOS**: App Store Connect API (JWT 인증) 로 리뷰 조회
- **Android**: Google Play Developer API (Service Account) 로 리뷰 조회
- **주기**: EventBridge 1시간 cron (`rate(1 hour)`)
- **중복 방지**: 리뷰 ID 기반으로 DynamoDB에 이미 존재하는지 확인 후 신규만 처리

### 2. 데이터 저장 (DynamoDB)

#### 테이블 스키마

| 필드 | 타입 | 설명 |
|------|------|------|
| `pk` (PK) | String | `REVIEW#{store}#{reviewId}` |
| `sk` (SK) | String | `CREATED#{ISO timestamp}` |
| `store` | String | `APP_STORE` \| `PLAY_STORE` |
| `reviewId` | String | 스토어 원본 리뷰 ID |
| `rating` | Number | 1~5 별점 |
| `title` | String | 리뷰 제목 (iOS만) |
| `body` | String | 리뷰 본문 |
| `author` | String | 작성자명 |
| `appVersion` | String | 앱 버전 |
| `language` | String | 리뷰 언어 |
| `createdAt` | String | 리뷰 작성 시간 (ISO) |
| `collectedAt` | String | 수집 시간 (ISO) |

#### GSI

- **GSI1**: `store` (PK) + `createdAt` (SK) → 스토어별 시간순 조회

### 3. Slack 알림

- **방식**: Slack Bot Token (`chat.postMessage`)
- **채널**: 통합 1개 채널 (`#app-reviews`)
- **포맷**: Simple Text

```
🍎 App Store | ⭐⭐⭐⭐⭐
"너무 좋은 앱이에요! 매칭이 잘 되고 UI가 예쁘네요"
- user123 | v2.3.1 | 2026-02-18
```

```
🤖 Play Store | ⭐⭐⭐
"매칭은 좋은데 가끔 느려요"
- androidUser | v2.3.0 | 2026-02-18
```

- 별점 1~2점: 🔴 접두사 추가로 시각적 강조
- 별점 3점: 🟡
- 별점 4~5점: 🟢

### 4. 과거 리뷰 마이그레이션

- 초기 배포 시 전체 과거 리뷰를 DynamoDB에 적재 (1회성)
- 마이그레이션 시에는 Slack 알림 미발송 (알림 폭탄 방지)
- Lambda 환경변수 또는 별도 invoke로 마이그레이션 모드 제어

## Terraform 리소스

| 리소스 | 설명 |
|--------|------|
| `aws_lambda_function` | 리뷰 수집 Lambda |
| `aws_dynamodb_table` | 리뷰 저장 테이블 + GSI |
| `aws_cloudwatch_event_rule` | 1시간 주기 cron |
| `aws_cloudwatch_event_target` | EventBridge → Lambda 연결 |
| `aws_iam_role` + `policy` | Lambda 실행 권한 (DynamoDB, SSM, CloudWatch Logs) |
| `aws_ssm_parameter` | Slack Bot Token, API 키 등 시크릿 |

## 비기능 요구사항

- Lambda 타임아웃: 5분 (리뷰 수집 + DynamoDB 쓰기 + Slack 발송)
- Lambda 메모리: 256MB
- DynamoDB: On-Demand 모드 (PAY_PER_REQUEST)
- CloudWatch Logs: Lambda 실행 로그 자동 보관
- 에러 시 CloudWatch Alarm → SNS (선택)

## API 인증 (준비 완료)

- **App Store Connect**: API Key (Key ID, Issuer ID, Private Key) → SSM Parameter
- **Google Play**: Service Account JSON → SSM Parameter

## 프로젝트 구조 (예상)

```
app-review-collector/
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── lambda.tf
├── src/
│   ├── index.ts          # Lambda handler
│   ├── collectors/
│   │   ├── app-store.ts  # iOS 리뷰 수집
│   │   └── play-store.ts # Android 리뷰 수집
│   ├── storage/
│   │   └── dynamodb.ts   # DynamoDB 저장/조회
│   ├── notifier/
│   │   └── slack.ts      # Slack 알림 발송
│   └── types.ts          # 공통 타입
├── package.json
├── tsconfig.json
└── esbuild.config.ts
```
