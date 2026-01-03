# 백엔드 알림 시스템 개선 요구사항

## 📋 요약

커뮤니티 댓글 알림에서 redirectUrl을 통한 게시글 이동 시 "게시글을 불러오는중 오류가 발생했습니다" 에러가 발생하는 문제를 근본적으로 해결하기 위한 백엔드 개선 요구사항입니다.

---

## 🎯 핵심 문제

1. **잘못된 redirectUrl 형식**: null, undefined, 빈 문자열 등이 포함된 URL
2. **삭제된 게시글 참조**: 게시글이 삭제되었는데 알림은 남아있음
3. **데이터 정합성 부족**: 알림 생성 시 유효성 검증 미흡

---

## ✅ 필수 개선사항

### 1. redirectUrl 형식 검증 및 표준화

#### 요구사항
- 알림 생성 시 `redirectUrl` 필드에 대한 **엄격한 유효성 검증** 적용
- 올바른 형식만 DB에 저장되도록 보장

#### redirectUrl 표준 형식

```typescript
// 커뮤니티 게시글
redirectUrl: `/community/{articleId}`

// 올바른 예시
✅ "/community/cm123abc"
✅ "/community/550e8400-e29b-41d4-a716-446655440000"

// 잘못된 예시 (저장 금지)
❌ "community/123"           // 앞에 / 없음
❌ "/community/"             // ID 누락
❌ "/community/undefined"    // undefined 문자열
❌ "/community/null"         // null 문자열
❌ "/community/"             // 빈 ID
❌ null                      // null 값 (필드는 optional이지만 값이 있으면 유효해야 함)
```

#### 구현 방법

```typescript
// 백엔드 검증 로직 예시 (Pseudo-code)
function validateRedirectUrl(url: string | null | undefined): boolean {
  // null/undefined는 허용 (optional field)
  if (url === null || url === undefined) {
    return true;
  }

  // 빈 문자열은 불허
  if (url.trim() === '') {
    return false;
  }

  // 슬래시로 시작하지 않으면 불허
  if (!url.startsWith('/')) {
    return false;
  }

  // undefined, null 문자열 포함 시 불허
  if (url.includes('undefined') || url.includes('null')) {
    return false;
  }

  // 커뮤니티 URL 검증
  const communityRegex = /^\/community\/[a-zA-Z0-9-]+$/;
  if (url.startsWith('/community/')) {
    return communityRegex.test(url);
  }

  // 다른 경로들도 추가 검증...

  return true;
}
```

---

### 2. 게시글 삭제 시 관련 알림 처리

#### 현재 문제
- 게시글이 삭제되어도 해당 게시글에 대한 알림이 남아있음
- 사용자가 알림을 클릭하면 404 에러 발생

#### 해결 방안 (3가지 옵션)

**옵션 A: 소프트 삭제 (Soft Delete) - 권장**
```sql
-- 게시글 삭제 시 관련 알림도 소프트 삭제
UPDATE notifications
SET deletedAt = NOW()
WHERE redirectUrl LIKE '/community/{articleId}%'
  AND deletedAt IS NULL;
```

**옵션 B: 하드 삭제 (Hard Delete)**
```sql
-- 게시글 삭제 시 관련 알림 완전 삭제
DELETE FROM notifications
WHERE redirectUrl LIKE '/community/{articleId}%';
```

**옵션 C: 상태 변경 (Status Update)**
```typescript
// 알림에 invalid 플래그 추가
interface Notification {
  // ...
  isInvalid?: boolean;  // 참조 대상이 삭제됨
  invalidReason?: string;  // 'article_deleted', 'user_blocked' 등
}

// 게시글 삭제 시
UPDATE notifications
SET isInvalid = true,
    invalidReason = 'article_deleted'
WHERE redirectUrl LIKE '/community/{articleId}%';
```

#### 권장: **옵션 A (소프트 삭제)**
- 데이터 히스토리 보존
- 프론트엔드 호환성 유지 (deletedAt 필드 이미 존재)
- 필요시 복구 가능

---

### 3. 알림 생성 시 참조 무결성 검증

#### 요구사항
커뮤니티 댓글 알림 생성 시, **게시글이 실제로 존재하는지 검증**

#### 구현 방법

```typescript
// 알림 생성 함수 (Pseudo-code)
async function createCommentNotification(
  articleId: string,
  commentAuthorId: string,
  commentContent: string
) {
  // 1. 게시글 존재 여부 확인
  const article = await db.articles.findById(articleId);

  if (!article || article.deletedAt) {
    throw new Error(`Cannot create notification: Article ${articleId} not found or deleted`);
  }

  // 2. redirectUrl 생성 및 검증
  const redirectUrl = `/community/${articleId}`;

  if (!validateRedirectUrl(redirectUrl)) {
    throw new Error(`Invalid redirectUrl format: ${redirectUrl}`);
  }

  // 3. 알림 생성
  const notification = await db.notifications.create({
    userId: article.authorId,
    type: 'contact',
    subType: 'community_comment',
    title: '새 댓글이 달렸습니다',
    content: truncate(commentContent, 50),
    redirectUrl,
    data: {
      articleId,
      commentAuthorId,
      profileImageUrl: commentAuthor.profileImageUrl,
    },
    isRead: false,
  });

  return notification;
}
```

---

### 4. 알림 조회 API 개선

#### 현재 문제
- 삭제된 게시글을 참조하는 알림도 그대로 반환됨

#### 개선 방안

**옵션 A: API 레벨에서 필터링 (권장)**
```typescript
// GET /notifications API
async function getNotifications(userId: string) {
  const notifications = await db.notifications.find({
    userId,
    deletedAt: null,  // 소프트 삭제된 알림 제외
  });

  return notifications;
}
```

**옵션 B: 유효성 플래그 추가**
```typescript
// 알림 조회 시 참조 대상 유효성 체크
async function getNotificationsWithValidation(userId: string) {
  const notifications = await db.notifications.find({ userId });

  // 각 알림의 참조 대상 유효성 검증
  return await Promise.all(
    notifications.map(async (notif) => {
      if (notif.redirectUrl?.startsWith('/community/')) {
        const articleId = extractArticleId(notif.redirectUrl);
        const articleExists = await db.articles.exists(articleId);

        return {
          ...notif,
          isValid: articleExists,
        };
      }
      return { ...notif, isValid: true };
    })
  );
}
```

---

### 5. 로깅 및 모니터링

#### 요구사항
- 알림 생성 실패 시 상세 로그 기록
- 잘못된 redirectUrl 형식 시도 시 알림 발송

#### 구현 예시

```typescript
// 로깅
logger.error('Failed to create notification', {
  articleId,
  redirectUrl,
  reason: 'Invalid redirectUrl format',
  timestamp: new Date().toISOString(),
});

// 모니터링 메트릭
metrics.increment('notification.creation.failed', {
  reason: 'invalid_redirect_url',
  subType: 'community_comment',
});
```

---

## 🔍 테스트 케이스

### 1. redirectUrl 검증 테스트

```typescript
describe('Notification redirectUrl validation', () => {
  test('유효한 커뮤니티 URL', () => {
    expect(validateRedirectUrl('/community/abc123')).toBe(true);
  });

  test('슬래시 없는 URL은 거부', () => {
    expect(validateRedirectUrl('community/abc123')).toBe(false);
  });

  test('undefined 문자열 포함 시 거부', () => {
    expect(validateRedirectUrl('/community/undefined')).toBe(false);
  });

  test('null 문자열 포함 시 거부', () => {
    expect(validateRedirectUrl('/community/null')).toBe(false);
  });

  test('빈 ID는 거부', () => {
    expect(validateRedirectUrl('/community/')).toBe(false);
  });

  test('null/undefined 값은 허용 (optional)', () => {
    expect(validateRedirectUrl(null)).toBe(true);
    expect(validateRedirectUrl(undefined)).toBe(true);
  });
});
```

### 2. 게시글 삭제 후 알림 처리 테스트

```typescript
describe('Article deletion cascading', () => {
  test('게시글 삭제 시 관련 알림도 소프트 삭제', async () => {
    const article = await createTestArticle();
    const notification = await createCommentNotification(article.id);

    await deleteArticle(article.id);

    const updatedNotification = await getNotification(notification.id);
    expect(updatedNotification.deletedAt).not.toBeNull();
  });
});
```

### 3. 알림 생성 시 게시글 존재 검증 테스트

```typescript
describe('Notification creation validation', () => {
  test('존재하지 않는 게시글에 대한 알림 생성 실패', async () => {
    const nonExistentArticleId = 'non-existent-id';

    await expect(
      createCommentNotification(nonExistentArticleId, 'user1', 'comment')
    ).rejects.toThrow('Article non-existent-id not found or deleted');
  });

  test('삭제된 게시글에 대한 알림 생성 실패', async () => {
    const article = await createTestArticle();
    await deleteArticle(article.id);

    await expect(
      createCommentNotification(article.id, 'user1', 'comment')
    ).rejects.toThrow();
  });
});
```

---

## 📊 우선순위

| 순위 | 항목 | 영향도 | 난이도 | 비고 |
|-----|------|-------|-------|------|
| 🔴 P0 | redirectUrl 형식 검증 | 높음 | 낮음 | 즉시 적용 가능 |
| 🔴 P0 | 알림 생성 시 게시글 존재 검증 | 높음 | 낮음 | 새 알림 생성부터 적용 |
| 🟡 P1 | 게시글 삭제 시 알림 처리 | 중간 | 중간 | 기존 데이터 정리 필요 |
| 🟡 P1 | 로깅 및 모니터링 | 중간 | 낮음 | 문제 추적용 |
| 🟢 P2 | 알림 조회 API 개선 | 낮음 | 중간 | P0 완료 후 필요 시 |

---

## 🚀 마이그레이션 계획

### Phase 1: 검증 로직 추가 (1-2일)
1. redirectUrl 검증 함수 구현
2. 알림 생성 시 게시글 존재 여부 확인
3. 단위 테스트 작성

### Phase 2: 기존 데이터 정리 (1일)
1. 잘못된 redirectUrl을 가진 알림 찾기
2. 소프트 삭제 또는 수정
3. 삭제된 게시글을 참조하는 알림 처리

### Phase 3: CASCADE 설정 (1일)
1. 게시글 삭제 시 알림 자동 처리 로직 추가
2. 통합 테스트
3. 프로덕션 배포

---

## 💬 질문 사항

배포 전 확인이 필요한 사항:

1. **현재 알림 생성 로직 위치**: 어느 서비스/컨트롤러에서 알림을 생성하나요?
2. **게시글 삭제 로직 위치**: CASCADE 설정을 어디에 추가해야 하나요?
3. **데이터베이스 타입**: PostgreSQL, MySQL, MongoDB 등?
4. **ORM/Query Builder**: Prisma, TypeORM, Sequelize 등?
5. **기존 잘못된 알림 데이터**: 대략 몇 건이나 존재하나요?

---

## 📞 연락처

프론트엔드 개발자: [담당자명]
- 추가 질문 사항이나 프론트엔드 수정 내용 확인 필요 시 연락 주세요.
- 프론트엔드에서는 방어 로직을 이미 추가했으나, 근본적 해결을 위해 백엔드 수정이 필요합니다.
