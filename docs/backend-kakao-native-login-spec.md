# 카카오 네이티브 로그인 백엔드 API 구현 가이드

## 📋 요구사항 개요

React Native 앱에서 카카오 네이티브 SDK를 사용한 로그인을 지원하기 위해 백엔드 API 수정이 필요합니다.

### 현재 상황
- **기존 API**: `POST /auth/oauth/kakao` - OAuth Authorization Code를 받아 처리
- **새로운 요구사항**: 네이티브 SDK가 반환하는 Access Token으로도 로그인 지원

### 목표
- 웹 플랫폼: 기존 방식 유지 (Authorization Code)
- 네이티브 앱: Access Token 직접 전송 (카카오톡 앱 연동)

---

## 🔧 구현 방법

### 옵션 1: 기존 엔드포인트 확장 (권장)

**장점**: 단일 엔드포인트로 두 방식 모두 처리
**URL**: `POST /auth/oauth/kakao`

**요청 본문 (확장)**:
```typescript
{
  code?: string;        // 웹 플랫폼용 (기존)
  accessToken?: string; // 네이티브 앱용 (신규)
}
```

**처리 로직**:
```
IF code가 있으면:
  → 기존 로직 실행 (code를 카카오 토큰으로 교환)
ELSE IF accessToken이 있으면:
  → 새 로직 실행 (accessToken 검증)
ELSE:
  → 400 Bad Request
```

### 옵션 2: 새 엔드포인트 생성

**장점**: 명확한 분리, 기존 코드 영향 없음
**URL**: `POST /auth/oauth/kakao/native`

**요청 본문**:
```typescript
{
  accessToken: string;
}
```

---

## 📚 카카오 Access Token 검증 방법

### 1. 토큰 검증 API 호출

**카카오 API**: `GET https://kapi.kakao.com/v1/user/access_token_info`

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**성공 응답 (200)**:
```json
{
  "id": 1234567890,
  "expires_in": 43199,
  "app_id": 12345
}
```

**실패 응답 (401)**:
```json
{
  "msg": "this access token does not exist",
  "code": -401
}
```

### 2. 사용자 정보 조회 API 호출

**카카오 API**: `GET https://kapi.kakao.com/v2/user/me`

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**요청 쿼리 파라미터** (필요한 정보만):
```
?property_keys=["kakao_account.profile","kakao_account.name","kakao_account.email","kakao_account.age_range","kakao_account.birthday","kakao_account.gender","kakao_account.phone_number","kakao_account.birthyear"]
```

**성공 응답**:
```json
{
  "id": 1234567890,
  "kakao_account": {
    "profile": {
      "nickname": "홍길동"
    },
    "name": "홍길동",
    "email": "user@example.com",
    "age_range": "20~29",
    "birthday": "1201",
    "birthyear": "1995",
    "gender": "male",
    "phone_number": "+82 10-1234-5678"
  }
}
```

---

## 💻 구현 예시 코드 (Node.js/TypeScript)

### 옵션 1 구현 예시

```typescript
import axios from 'axios';

interface KakaoUserInfo {
  id: number;
  kakao_account: {
    name?: string;
    email?: string;
    phone_number?: string;
    birthday?: string;
    birthyear?: string;
    gender?: 'male' | 'female';
  };
}

async function verifyKakaoAccessToken(accessToken: string): Promise<boolean> {
  try {
    const response = await axios.get(
      'https://kapi.kakao.com/v1/user/access_token_info',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error('카카오 토큰 검증 실패:', error);
    return false;
  }
}

async function getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
  const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      property_keys: JSON.stringify([
        'kakao_account.profile',
        'kakao_account.name',
        'kakao_account.email',
        'kakao_account.phone_number',
        'kakao_account.birthday',
        'kakao_account.birthyear',
        'kakao_account.gender',
      ]),
    },
  });

  return response.data;
}

// 기존 엔드포인트 수정
app.post('/auth/oauth/kakao', async (req, res) => {
  const { code, accessToken } = req.body;

  // 1. Code 방식 (기존 웹)
  if (code) {
    // 기존 로직 유지
    const kakaoTokenResponse = await exchangeCodeForToken(code);
    const userInfo = await getKakaoUserInfo(kakaoTokenResponse.access_token);
    // ... 기존 로직 계속
  }

  // 2. Access Token 방식 (신규 네이티브)
  else if (accessToken) {
    // 토큰 검증
    const isValid = await verifyKakaoAccessToken(accessToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Kakao access token' });
    }

    // 사용자 정보 조회
    const userInfo = await getKakaoUserInfo(accessToken);

    // 기존 로직과 동일하게 처리
    const certificationInfo = {
      name: userInfo.kakao_account.name,
      phone: userInfo.kakao_account.phone_number?.replace(/\s|-/g, ''),
      birthday: userInfo.kakao_account.birthday,
      birthyear: userInfo.kakao_account.birthyear,
      gender: userInfo.kakao_account.gender === 'male' ? 'M' : 'F',
    };

    // DB에서 사용자 조회 또는 생성
    const user = await findOrCreateUserByKakaoId(userInfo.id);

    if (user.isNewUser) {
      // 신규 사용자
      return res.json({
        isNewUser: true,
        certificationInfo,
      });
    } else {
      // 기존 사용자 - 토큰 발급
      const tokens = generateTokens(user);
      return res.json({
        isNewUser: false,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userId: user.id,
      });
    }
  }

  // 3. 둘 다 없으면 에러
  else {
    return res.status(400).json({
      error: 'Either code or accessToken is required'
    });
  }
});
```

---

## 🔒 보안 고려사항

### 1. Access Token 검증 필수
- 클라이언트에서 받은 `accessToken`을 **반드시 카카오 API로 검증**
- 검증 없이 신뢰하면 보안 취약점 발생

### 2. Rate Limiting
- 동일 IP에서 과도한 요청 방지
- 카카오 API 호출 제한 고려

### 3. 에러 핸들링
```typescript
try {
  const isValid = await verifyKakaoAccessToken(accessToken);
  if (!isValid) {
    throw new Error('Invalid token');
  }
} catch (error) {
  // 카카오 API 장애 시 적절한 에러 응답
  return res.status(503).json({
    error: 'Kakao service temporarily unavailable'
  });
}
```

### 4. 토큰 만료 처리
- Access Token 검증 시 401 응답이 오면 클라이언트에 재로그인 요청

---

## 🧪 테스트 방법

### 1. 수동 테스트

**카카오 Developers 콘솔에서 테스트 토큰 발급**:
1. https://developers.kakao.com/console 접속
2. 앱 선택 → 도구 → REST API 테스트
3. Access Token 발급 받기

**cURL 테스트**:
```bash
curl -X POST http://localhost:3000/auth/oauth/kakao \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_KAKAO_ACCESS_TOKEN"
  }'
```

### 2. 응답 검증

**신규 사용자 응답**:
```json
{
  "isNewUser": true,
  "certificationInfo": {
    "name": "홍길동",
    "phone": "01012345678",
    "birthday": "1201",
    "birthyear": "1995",
    "gender": "M"
  }
}
```

**기존 사용자 응답**:
```json
{
  "isNewUser": false,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "userId": 123
}
```

---

## 📝 API 스펙 문서

### POST /auth/oauth/kakao

**요청**:
```typescript
{
  code?: string;        // OAuth Authorization Code (웹)
  accessToken?: string; // Kakao Access Token (네이티브)
}
```

**응답 - 신규 사용자**:
```typescript
{
  isNewUser: true;
  certificationInfo: {
    name: string;
    phone: string;      // 하이픈 제거된 전화번호
    birthday: string;   // MMDD 형식
    birthyear: string;  // YYYY 형식
    gender: 'M' | 'F';
  }
}
```

**응답 - 기존 사용자**:
```typescript
{
  isNewUser: false;
  accessToken: string;
  refreshToken: string;
  userId: number;
}
```

**에러 응답**:
```typescript
{
  error: string;
}
```

---

## ✅ 체크리스트

백엔드 구현 시 확인해야 할 항목:

- [ ] Access Token 검증 API 호출 구현
- [ ] 사용자 정보 조회 API 호출 구현
- [ ] 전화번호 포맷 정규화 (하이픈, 공백 제거)
- [ ] 성별 매핑 (male → M, female → F)
- [ ] 카카오 ID로 사용자 조회/생성 로직
- [ ] 기존 code 방식과 동일한 응답 구조 유지
- [ ] 에러 핸들링 (401, 503 등)
- [ ] 로깅 추가 (디버깅용)
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성

---

## 🔗 참고 자료

- [카카오 로그인 REST API 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [사용자 정보 가져오기 API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info)
- [토큰 정보 보기 API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#get-token-info)

---

## 💡 추가 개선 제안

### 1. 토큰 캐싱
카카오 API 호출 최소화를 위해 검증된 토큰 정보를 Redis에 짧은 시간(5분) 캐싱

### 2. 통합 로깅
카카오 로그인 시도, 성공, 실패를 모니터링 시스템에 로깅

### 3. A/B 테스트
네이티브 로그인 전환율 측정을 위한 이벤트 로깅

---

## 🙋‍♂️ 질문이 있으신가요?

프론트엔드 팀 연락처: [팀 슬랙 채널 또는 이메일]

구현 중 문제가 발생하면 언제든 연락 주세요!
