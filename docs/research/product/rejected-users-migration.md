---
linear_id: "a4aae41a-8fd0-444b-9293-83fb50a47fc0"
title: "untitled-a4aae41a"
url: "https://linear.app/smartnewbie/document/untitled-959dc0dad278"
creator_email: "smartnewb2@gmail.com"
created_at: "2026-01-08T09:51:28.790Z"
updated_at: "2026-01-08T09:54:13.894Z"
---
# 승인거부 사용자 → 회원적격심사 마이그레이션 보고서

**작성일**: 2026-01-08  
**작성자**: 개발팀  
**승인 요청 대상**: CTO

---

## 1\. 개요

### 배경

현재 어드민의 **"승인관리"** 기능에 **REJECTED(승인거부)** 상태인 사용자가 **1,419명** 존재합니다. 기존 승인관리 시스템은 더 이상 사용하지 않고, **"회원적격심사"** 시스템으로 일원화하여 운영하고 있습니다.

### 목적

REJECTED 상태로 방치된 1,419명의 사용자들을 회원적격심사 시스템으로 이관하여, 재심사 기회를 부여하고 운영 효율성을 높입니다.

---

## 2\. 현황 분석

### 기존 시스템 비교

| 구분 | 승인관리 (기존) | 회원적격심사 (현재) |
| -- | -- | -- |
| **심사 단위** | 사용자 전체 | 프로필 이미지 개별 |
| **심사 기준** | 관리자 판단 | 이미지별 적격 여부 |
| **상태 저장** | `users.status` | `profile_images.review_status` |
| **운영 상태** | **미사용** | **활성** |

### 대상 데이터

| 항목 | 수치 |
| -- | -- |
| REJECTED 상태 사용자 | 1,419명 |
| 해당 사용자의 프로필 이미지 | 약 2,800\~4,200장 (추정) |
| 탈퇴하지 않은 활성 사용자 | 1,419명 전체 |

---

## 3\. 마이그레이션 계획

### 3.1 실행 내용

**Step 1**: REJECTED 사용자들의 프로필 이미지 상태 변경

```sql
UPDATE profile_images 
SET review_status = 'pending'
WHERE profile_id IN (
    SELECT p.id FROM profiles p
    JOIN users u ON u.id = p.user_id
    WHERE u.status = 'rejected' AND u.deleted_at IS NULL
)
```

**Step 2**: REJECTED 사용자들의 상태 변경

```sql
UPDATE users 
SET status = 'pending'
WHERE status = 'rejected' AND deleted_at IS NULL
```

### 3.2 마이그레이션 파일

* **파일 위치**: `src/database/migrations/20260108_migrate_rejected_users_to_profile_review.ts`
* **커밋**: `01554ee`
* **적용 스키마**: `public`, `kr`, `jp` (멀티 국가 스키마 대응)

---

## 4\. 영향 범위

### 4.1 시스템 영향

| 영역 | 영향 | 비고 |
| -- | -- | -- |
| **회원적격심사 목록** | 1,419명 추가 표시 | 심사 대기열 증가 |
| **승인관리** | 변화 없음 | 기존 시스템 미사용 |
| **사용자 경험** | 앱 접근 가능 | 심사 완료 시 정상 이용 |
| **푸시 알림** | 승인/거부 시 발송 | 심사 완료 후 |

### 4.2 운영 영향

| 항목 | 내용 |
| -- | -- |
| **추가 심사 업무** | 1,419명의 프로필 이미지 심사 필요 |
| **예상 소요 시간** | 1인당 평균 2장 × 30초 = 약 24시간 (1명 기준) |
| **권장 처리 방안** | 팀원 분배 또는 단계적 처리 |

---

## 5\. 롤백 계획

### 자동 롤백 불가

* 원래 REJECTED였던 사용자 목록을 별도 보관하지 않으면 자동 복원 불가
* 필요 시 마이그레이션 전 백업 데이터 활용

### 수동 롤백 절차 (비상 시)

```sql
-- 특정 시점 이후 pending으로 변경된 사용자 복원
UPDATE users 
SET status = 'rejected'
WHERE status = 'pending' 
  AND updated_at >= '2026-01-08 XX:XX:XX';
```

---

## 6\. 실행 절차

### 사전 준비

1. \[ \] 프로덕션 DB 백업 확인
2. \[ \] 마이그레이션 코드 배포 (`01554ee` 커밋 포함)

### 실행

```bash
# 마이그레이션 실행
pnpm run migration:run
```

### 사후 확인

1. \[ \] REJECTED 사용자 수 확인 (0명 예상)
2. \[ \] 회원적격심사 목록에서 신규 pending 사용자 확인
3. \[ \] 운영팀 심사 업무 시작 안내

---

## 7\. 승인 요청

아래 사항에 대해 CTO 승인을 요청드립니다:

- [ ] **마이그레이션 실행 승인**
- [ ] **실행 일시**: \___\_년 \_\_월 \_\_일 \_\_시
- [ ] **담당자**: \_______________\_

---

## 8\. 첨부

### 마이그레이션 파일 전체 코드

```typescript
import { sql } from 'drizzle-orm';

export async function up(db: any): Promise<void> {
  console.log('[Migration] Migrating rejected users to profile review system...');

  // Step 1: 프로필 이미지 상태를 pending으로 변경
  await db.execute(sql`
    UPDATE public.profile_images 
    SET review_status = 'pending', updated_at = NOW()
    WHERE profile_id IN (
      SELECT p.id FROM public.profiles p
      JOIN public.users u ON u.id = p.user_id
      WHERE u.status = 'rejected' AND u.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  `);

  // kr, jp 스키마도 동일하게 적용
  await db.execute(sql`UPDATE kr.profile_images SET review_status = 'pending', updated_at = NOW() WHERE profile_id IN (SELECT p.id FROM kr.profiles p JOIN kr.users u ON u.id = p.user_id WHERE u.status = 'rejected' AND u.deleted_at IS NULL) AND deleted_at IS NULL`);
  
  await db.execute(sql`UPDATE jp.profile_images SET review_status = 'pending', updated_at = NOW() WHERE profile_id IN (SELECT p.id FROM jp.profiles p JOIN jp.users u ON u.id = p.user_id WHERE u.status = 'rejected' AND u.deleted_at IS NULL) AND deleted_at IS NULL`);

  // Step 2: 사용자 상태를 pending으로 변경
  await db.execute(sql`UPDATE public.users SET status = 'pending', updated_at = NOW() WHERE status = 'rejected' AND deleted_at IS NULL`);
  await db.execute(sql`UPDATE kr.users SET status = 'pending', updated_at = NOW() WHERE status = 'rejected' AND deleted_at IS NULL`);
  await db.execute(sql`UPDATE jp.users SET status = 'pending', updated_at = NOW() WHERE status = 'rejected' AND deleted_at IS NULL`);

  console.log('[Migration] Successfully migrated rejected users to profile review system');
}

export async function down(db: any): Promise<void> {
  console.log('[Migration] WARNING: Cannot automatically rollback - manual intervention required');
}
```

---

**문의**: 개발팀
