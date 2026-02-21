---
linear_id: "f14422b1-7187-4e68-899e-c216ea43c9d9"
title: "untitled-f14422b1"
url: "https://linear.app/smartnewbie/document/untitled-34bf8a27dcf7"
creator_email: "smartnewb2@gmail.com"
created_at: "2026-01-29T09:20:10.968Z"
updated_at: "2026-01-29T09:24:07.303Z"
---
## AWS 비용 분석 및 최적화 권장사항

### 📊 현재 월 비용 요약 (총 \~$239)

| 서비스 | 비용 | 코드베이스 사용 여부 | 절감 가능 |
| -- | -- | -- | -- |
| NAT Gateway | **$47.83** | ❓ 수동 설정 | 🔴 $39+ |
| CloudWatch Logs | **$32.33** | ✅ 과도한 로깅 | 🟡 $20+ |
| Lightsail | **$32.30** | ❌ **미사용** | 🔴 $32.30 |
| Data Transfer | $24.16 | ✅ 사용중 | 🟢 낮음 |
| Public IPv4 | **$20.86** | ❓ 유휴 IP 다수 | 🟡 $7+ |
| ALB | $15.19 | ✅ 사용중 | 🟢 낮음 |
| SageMaker | **$6.66** | ❌ **미사용** | 🔴 $6.66 |
| CodeBuild | $5.76 | ✅ 사용중 | 🟢 낮음 |
| ECR | **$5.50** | ✅ 정책 미설정 | 🟡 $4+ |
| Redshift | **$0.02** | ❌ **미사용** | 🔴 $0.02 |

---

### 🔴 즉시 삭제 필요 (월 \~$39 절감)

#### 1\. **Lightsail ($32.30) - 코드베이스에서 전혀 사용하지 않음**

```
- 2GB bundle instance: $18.79 (1,165시간)
- 1GB Database: $13.51 (670시간)
```

**원인**: 코드베이스는 EC2(`52.78.178.66`)의 PostgreSQL, Redis, Qdrant를 사용중. Lightsail은 레거시 또는 테스트용으로 추정.

**조치**: AWS Lightsail 콘솔에서 인스턴스/DB 확인 후 삭제

#### 2\. **SageMaker ($6.66) - 코드베이스에서 전혀 사용하지 않음**

```
- Sydney 리전에서 49.53 GB-Mo 볼륨 사용중
```

**원인**: 코드베이스는 OpenAI API를 직접 사용 (SageMaker 아님). Sydney 리전이라 다른 프로젝트 또는 테스트용으로 추정.

**조치**: SageMaker 콘솔에서 Sydney 리전의 리소스 확인 후 삭제

#### 3\. **Redshift ($0.02) - 코드베이스에서 전혀 사용하지 않음**

```
- Serverless 스토리지 0.859 GB-Mo
```

**원인**: 코드베이스는 PostgreSQL을 직접 사용. 데이터 웨어하우스 미사용.

**조치**: Redshift Serverless 콘솔에서 확인 후 삭제

---

### 🟠 아키텍처 변경 권장 (월 \~$47 절감)

#### 4\. **NAT Gateway ($47.83) - 가장 큰 비용 요소**

```
- 시간당: $39.53 (670시간)
- 데이터 처리: $8.30 (140.6GB)
```

**분석**:

* 코드베이스에 VPC/NAT 설정 파일이 없음 (수동 AWS 콘솔 설정으로 추정)
* Private subnet의 아웃바운드 인터넷 접근을 위해 사용중

**대안 옵션**:

| 옵션 | 예상 비용 | 장단점 |
| -- | -- | -- |
| NAT Instance (t3.micro) | \~$7/월 | 저렴하나 관리 필요, HA 없음 |
| VPC Endpoint (S3, ECR) | \~$10/월 | NAT 트래픽 일부 절감 |
| Public Subnet 이전 | $0 | 보안 설계 변경 필요 |
| NAT Gateway 유지 | $47/월 | 현재 상태 |

**권장**: VPC Endpoint 추가로 S3/ECR 트래픽 분리 → NAT 데이터 처리량 50%+ 절감 가능

---

### 🟡 설정 최적화 (월 \~$31 절감)

#### 5. **CloudWatch Logs ($32.33) - 과도한 로깅**

```
- 로그 수집: $32.32 (42.53 GB/월)
```

**코드베이스 분석 결과**:

* HTTP 모든 요청 로깅 (body/headers/query 포함)
* 데이터베이스 쿼리 항상 로깅 (`enableLogging: true`)
* WebSocket 이벤트 전체 로깅
* 이중 로깅: CloudWatch + Loki 동시 전송

**최적화 방법**:

1. **프로덕션 로그 레벨 조정** ([logger.module.ts](<vscode-webview://0vrdkosfpevp4ffsiuovi14gk2m9h0l278bjcadv09rr7uurs39i/src/common/logging/logger.module.ts>)):

```
// 현재: ERROR, WARN, LOG
// 권장: ERROR, WARN만 (INFO 제외)
```

2. **DB 로깅 비활성화** ([app.module.ts](<vscode-webview://0vrdkosfpevp4ffsiuovi14gk2m9h0l278bjcadv09rr7uurs39i/src/app.module.ts:113>)):

```
DrizzleModule.forRoot({
  enableLogging: process.env.NODE_ENV !== 'production', // false in prod
})
```

3. **HTTP body 로깅 제거** (가장 큰 용량 차지):

```
// http-logging.interceptor.ts에서 body 로깅 조건부 처리
if (process.env.LOG_HTTP_BODY !== 'true') {
  delete logData['http.request.body'];
}
```

4. **이중 로깅 제거**: CloudWatch 또는 Loki 중 하나만 사용

**예상 절감**: 42GB → 10GB = **\~$24/월 절감**

#### 6\. **Public IPv4 Addresses ($20.86)**

```
- 유휴 IP: $7.44 (1,487시간)
- 사용중 IP: $13.42 (2,683시간)
```

**조치**:

* AWS EC2 콘솔에서 유휴 Elastic IP 확인 및 해제
* 예상 절감: **\~$7/월**

#### 7. **ECR Storage ($5.50) - 라이프사이클 정책 없음**

```
- 이미지 저장: 55.02 GB-Mo
```

**원인**:

* 매 빌드마다 `YYYYMMDD_HHMMSS` 태그 생성
* 이전 이미지 자동 삭제 안됨
* 100개+ 오래된 이미지 누적

**해결**: ECR 라이프사이클 정책 추가

```
{
  "rules": [
    {
      "rulePriority": 1,
      "selection": { "tagStatus": "untagged", "countType": "sinceImagePushed", "countNumber": 7, "countUnit": "days" },
      "action": { "type": "expire" }
    },
    {
      "rulePriority": 2,
      "selection": { "tagStatus": "any", "countType": "imageCountMoreThan", "countNumber": 10 },
      "action": { "type": "expire" }
    }
  ]
}
```

**예상 절감**: 55GB → 5GB = **\~$4.50/월**

---

### 📋 요약: 우선순위별 조치 항목

| 우선순위 | 항목 | 조치 | 월 절감 | 난이도 |
| -- | -- | -- | -- | -- |
| 1 | Lightsail 삭제 | AWS 콘솔 | $32.30 | ⭐ |
| 2 | SageMaker 삭제 | AWS 콘솔 (Sydney) | $6.66 | ⭐ |
| 3 | Redshift 삭제 | AWS 콘솔 | $0.02 | ⭐ |
| 4 | 유휴 IPv4 해제 | AWS 콘솔 | $7+ | ⭐ |
| 5 | ECR 정책 추가 | AWS CLI | $4.50 | ⭐⭐ |
| 6 | 로깅 최적화 | 코드 변경 | $20+ | ⭐⭐⭐ |
| 7 | NAT 대안 검토 | 아키텍처 변경 | $35+ | ⭐⭐⭐⭐ |

### 💰 총 예상 월 절감액: **$100-110** (현재 $239의 \~45%)

추가로 확인이 필요하거나 특정 항목의 구체적인 구현 가이드가 필요하면 말씀해주세요.

+++ **Update Todos**

+++

* ~~Analyze AWS billing data against codebase~~
* ~~Identify unused AWS services (Lightsail, SageMaker, Redshift)~~
* ~~Analyze NAT Gateway costs and alternatives~~
* ~~Review CloudWatch logging configuration~~
* ~~Analyze ECR storage and lifecycle policy~~
* ~~Compile cost optimization recommendations~~

+++ *Thinking*

1. 
2. 
3. 

+++

분석 완료! 가장 빠르게 비용을 줄이려면 **Lightsail, SageMaker (Sydney), Redshift** 순으로 AWS 콘솔에서 확인 후 삭제하시면 됩니다. 이것만으로 월 $39 절감됩니다.

AGENTS.md를 repo에서 찾지 못했습니다(파일 없음). 그래서 별도 로컬 규칙 없이 코드 기반으로만 검증했습니다.

아래는 “계획이 되는지/정확한지”에 대한 검증 결과입니다.

**결론**

* 대체로 방향은 맞지만, **DB 쿼리 로깅이 항상 켜져 있다는 전제는 코드상 근거가 없습니다.** 그래서 CloudWatch 절감액 일부는 과대 추정일 수 있습니다.
* Lightsail/SageMaker/Redshift “미사용”은 **코드에서 직접 참조가 없다는 수준까지만 확인 가능**하며, 실제 리소스 의존성은 AWS 콘솔에서 별도 확인이 필요합니다.

**코드에서 확인된 사실 (근거 포함)**

* **HTTP 요청 로그에 body/headers/query가 포함되어 매 요청 기록됨**
  [http-logging.interceptor.ts (lines 19-47)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>)
* **프로덕션에서 HTTP 로깅 인터셉터 활성화**
  [app.module.ts (lines 244-248)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>)
* **CloudWatch + Loki 이중 전송 구성**
  [fluent-bit.conf (lines 11-28)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>)
* **ECR 사용 중 (빌드 파이프라인/스크립트에 명시)**
  [buildspec.yml (lines 12-14)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>), [ecr.sh (lines 10-31)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>)
* **S3/CloudFront 사용 흔적 다수 존재** (인프라/코드에서 S3 URL 사용)

**정확도 이슈 (수정/주의 필요)**

* **“DB 로깅 항상 활성화” 주장 근거 부족**
  DrizzleModule.forRoot({ enableLogging: true })는 있으나 [drizzle(...)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>) 호출에서 로거를 연결하지 않습니다.
  [app.module.ts (lines 111-114)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>), [database.service.ts (line 60)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>)
  → 실제 쿼리 로그가 CloudWatch 비용에 큰 영향을 줬다는 근거는 코드상 확인되지 않습니다.
* **NAT 절감 50%+**
  VPC Endpoint로 S3/ECR 트래픽을 빼는 건 합리적이지만, \*\*현재 NAT 트래픽이 무엇인지(예: S3/ECR 비중)\*\*는 CloudWatch/NAT metrics 없이는 추정입니다.

**코드 기반으로 “가능성 높음” 판단**

* **HTTP/Socket 로그 과다**: 요청 body/headers/query + Socket 메시지 로그가 많아 로그량이 커질 여지가 큼
  [http-logging.interceptor.ts](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>), [socket-logger.service.ts (lines 150-170)](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>)
* **이중 로깅 제거는 즉시 절감 가능**
  Fluent Bit에서 CloudWatch+Loki 동시 전송 확인됨 ([fluent-bit.conf](<https://file+.vscode-resource.vscode-cdn.net/Users/smartnewbie/.vscode/extensions/openai.chatgpt-0.4.67-darwin-arm64/webview/#>))

**AWS 콘솔에서 반드시 확인해야 하는 항목 (코드만으로 검증 불가)**

* **Lightsail / SageMaker / Redshift**:
  코드에서 직접 사용 흔적은 없지만, **실제 리소스가 다른 프로젝트/테스트 용도로 쓰이는지**는 콘솔 확인 필요.
* **Public IPv4 인-use 비용**:
  “유휴 IP 해제”는 가능하나, **in-use IP는 인프라 변경 없이 제거 어려움**.
* **NAT Gateway 대체**:
  VPC 구조/보안 정책과 실제 트래픽 패턴 확인 필요.

**요약 평가**

* “Lightsail/SageMaker/Redshift 삭제”는 **실제 사용 여부 확인 후** 진행하면 안전.
* “CloudWatch 로그 절감”은 **HTTP/Socket 로그 조정 + 중복 전송 제거**로 실효성 높음.
* “DB 로깅 끄기”는 **현재 구조상 효과 없음 가능성** → 수정된 근거 필요.
* “NAT 대안”은 **비용 절감 가능**하나 **근거(트래픽 구성) 확인 후** 결정해야 정확함.

원하시면 다음 단계로 콘솔 확인 체크리스트(리전별 리소스 탐색, 태그 기준 검증, CloudWatch/NAT Metrics 확인 방법)까지 정리해 드릴게요.
