# Backend i18n API 설계 명세서

**목적**: 클라이언트 다국어(ko/ja/en) 지원을 위한 API 수정
**우선순위**: 높음
**영향 범위**: 3개 API 엔드포인트, 11개 데이터 필드
**작성일**: 2025-12-31

---

## 📋 요약

### 현재 문제

**서버**: 한글 문자열로 데이터 전송
**클라이언트**: 하드코딩 한글과 비교
**결과**: i18n 적용 불가 ❌

### 해결 방법

**서버**: 리전별 번역 데이터 또는 ID + 클라이언트 번역
**클라이언트**: ID 기반 비교 + i18n 적용
**결과**: 완전한 다국어 지원 ✅

---

## 🎯 영향받는 API (3개)

### 1. **선호도 옵션 API** (2개)

#### 1.1 나이 선호도
- **엔드포인트**: `GET /api/preferences/age`
- **영향 필드**: `displayName` (3개 옵션)

#### 1.2 문신 선호도
- **엔드포인트**: `GET /api/preferences/tattoo`
- **영향 필드**: `displayName` (2개 옵션)

### 2. **파트너 정보 API** (1개)

- **엔드포인트**: `GET /api/partner/:id`
- **영향 필드**: `characteristics` 객체 키 (6개)

---

## 📐 제안하는 API 설계

### 옵션 A: **ID + 클라이언트 번역** (권장) ⭐

**장점**:
- ✅ 서버 수정 최소화
- ✅ 클라이언트 번역 제어 가능
- ✅ 새 언어 추가 시 서버 배포 불필요

**단점**:
- 클라이언트가 모든 번역 관리

---

#### API 1.1: 나이 선호도 (Age Preference)

##### 현재 응답

```json
GET /api/preferences/age

{
  "typeName": "선호 나이대",
  "options": [
    {
      "id": "1",
      "displayName": "동갑"
    },
    {
      "id": "2",
      "displayName": "연하"
    },
    {
      "id": "3",
      "displayName": "연상"
    }
  ]
}
```

##### 제안 응답 ✅

```json
GET /api/preferences/age

{
  "typeName": "선호 나이대",
  "typeKey": "AGE_PREFERENCE",  // ← 추가!
  "options": [
    {
      "id": "1",
      "displayName": "동갑",     // 호환성 유지 (deprecated)
      "key": "SAME_AGE"          // ← 추가! (영어 ID)
    },
    {
      "id": "2",
      "displayName": "연하",
      "key": "YOUNGER"
    },
    {
      "id": "3",
      "displayName": "연상",
      "key": "OLDER"
    }
  ]
}
```

##### 클라이언트 사용법

```typescript
// app/interest/age.tsx
const { t } = useTranslation();

const loaded = preferences.options.map((option) => ({
  value: option.id,
  label: t(`apps.interest.age.${option.key.toLowerCase()}`), // ← i18n!
  image: getAgeImage(option.key),  // ← key로 비교
}));

function getAgeImage(key: string) {
  switch (key) {
    case "SAME_AGE": return require("@assets/images/age/same.png");
    case "YOUNGER": return require("@assets/images/age/under.png");
    case "OLDER": return require("@assets/images/age/high.png");
    default: return require("@assets/images/age/nothing.png");
  }
}
```

##### i18n JSON

```json
// locales/ko/apps/interest.json
{
  "age": {
    "same_age": "동갑",
    "younger": "연하",
    "older": "연상"
  }
}

// locales/ja/apps/interest.json
{
  "age": {
    "same_age": "同い年",
    "younger": "年下",
    "older": "年上"
  }
}

// locales/en/apps/interest.json
{
  "age": {
    "same_age": "Same Age",
    "younger": "Younger",
    "older": "Older"
  }
}
```

---

#### API 1.2: 문신 선호도 (Tattoo Preference)

##### 현재 응답

```json
GET /api/preferences/tattoo

{
  "typeName": "문신 선호도",
  "options": [
    {
      "id": "1",
      "displayName": "문신 없음"
    },
    {
      "id": "2",
      "displayName": "작은 문신"
    },
    {
      "id": "3",
      "displayName": "문신 O"
    }
  ]
}
```

##### 제안 응답 ✅

```json
GET /api/preferences/tattoo

{
  "typeName": "문신 선호도",
  "typeKey": "TATTOO_PREFERENCE",  // ← 추가!
  "options": [
    {
      "id": "1",
      "displayName": "문신 없음",   // deprecated
      "key": "NO_TATTOO"            // ← 추가!
    },
    {
      "id": "2",
      "displayName": "작은 문신",
      "key": "SMALL_TATTOO"
    },
    {
      "id": "3",
      "displayName": "문신 O",
      "key": "HAS_TATTOO"
    }
  ]
}
```

##### 클라이언트 사용법

```typescript
// app/interest/tattoo.tsx
const options = preferences.options.map((option) => {
  // 서버에서 key가 있으면 사용, 없으면 displayName으로 폴백
  const optionKey = option.key || getTattooKeyFromDisplayName(option.displayName);

  return {
    ...option,
    displayName: t(`apps.interest.tattoo.${optionKey.toLowerCase()}`),
  };
});
```

---

#### API 2: 파트너 상세 정보 (Partner Details)

##### 현재 응답

```json
GET /api/partner/:id

{
  "id": "123",
  "name": "홍길동",
  "characteristics": {
    "성격": [
      { "id": "1", "label": "활발한" },
      { "id": "2", "label": "차분한" }
    ],
    "연애 스타일": [
      { "id": "3", "label": "로맨틱" }
    ],
    "관심사": [
      { "id": "4", "label": "운동" },
      { "id": "5", "label": "영화" }
    ]
  }
}
```

##### 제안 응답 ✅

```json
GET /api/partner/:id

{
  "id": "123",
  "name": "홍길동",
  "characteristics": {
    "PERSONALITY": [              // ← 영어 키로 변경!
      {
        "id": "1",
        "label": "활발한",        // deprecated
        "key": "ENERGETIC"        // ← 추가!
      },
      {
        "id": "2",
        "label": "차분한",
        "key": "CALM"
      }
    ],
    "DATING_STYLE": [
      {
        "id": "3",
        "label": "로맨틱",
        "key": "ROMANTIC"
      }
    ],
    "INTERESTS": [
      {
        "id": "4",
        "label": "운동",
        "key": "SPORTS"
      },
      {
        "id": "5",
        "label": "영화",
        "key": "MOVIES"
      }
    ]
  }
}
```

##### 클라이언트 사용법

```typescript
// app/partner/view/[id].tsx
const { t } = useTranslation();

// Before
parser.getMultipleCharacteristicsOptions(
  ["성격"],  // 한글 키
  partner.characteristics
)["성격"]

// After
parser.getMultipleCharacteristicsOptions(
  ["PERSONALITY"],  // 영어 키
  partner.characteristics
)["PERSONALITY"]?.map((item) => ({
  ...item,
  label: t(`characteristics.${item.key.toLowerCase()}`),  // i18n 적용
}))
```

---

## 🔄 옵션 B: **서버에서 번역 전송** (대안)

**장점**:
- 클라이언트 코드 최소 변경
- 서버가 번역 완전 제어

**단점**:
- 서버 부하 증가
- 새 언어 추가 시 서버 배포 필요
- 번역 관리 복잡

### 구현 방법

#### 요청 헤더

```http
GET /api/preferences/age
Accept-Language: ja-JP
```

#### 서버 응답 (일본어)

```json
{
  "typeName": "年齢の好み",       // ← 서버에서 번역!
  "options": [
    {
      "id": "1",
      "displayName": "同い年",   // ← 일본어로 전송
      "key": "SAME_AGE"
    },
    {
      "id": "2",
      "displayName": "年下",
      "key": "YOUNGER"
    },
    {
      "id": "3",
      "displayName": "年上",
      "key": "OLDER"
    }
  ]
}
```

#### 클라이언트 사용법

```typescript
// app/interest/age.tsx
// 서버에서 이미 번역되어 왔으므로 그대로 사용
const loaded = preferences.options.map((option) => ({
  value: option.id,
  label: option.displayName,  // ← 서버 번역 그대로
  image: getAgeImage(option.key),  // ← key로 이미지 매칭
}));
```

---

## 📊 두 방법 비교

| 항목 | 옵션 A (클라이언트 번역) | 옵션 B (서버 번역) |
|------|------------------------|------------------|
| 서버 수정 | `key` 필드만 추가 ✅ | 번역 로직 추가 |
| 클라이언트 수정 | i18n 적용 | 최소 변경 ✅ |
| 새 언어 추가 | JSON 파일만 | 서버 배포 필요 |
| 성능 | 클라이언트 처리 | 서버 부하 |
| 유지보수 | 클라이언트 집중 ✅ | 서버/클라이언트 분산 |
| 번역 일관성 | 클라이언트 제어 ✅ | 서버 제어 |
| **권장도** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 최종 권장 설계: **옵션 A (ID + 클라이언트 번역)**

### 변경 사항 요약

#### 1. 모든 선호도 옵션 API에 `key` 필드 추가

```typescript
// 공통 옵션 스키마
interface PreferenceOption {
  id: string;
  displayName: string;  // deprecated (호환성 유지)
  key: string;          // NEW! 영어 상수 ID
}

interface PreferenceType {
  typeName: string;     // deprecated
  typeKey: string;      // NEW!
  options: PreferenceOption[];
}
```

#### 2. 파트너 characteristics 구조 변경

```typescript
// Before (한글 키)
characteristics: {
  "성격": Array<{ id, label }>,
  "연애 스타일": Array<{ id, label }>,
  "관심사": Array<{ id, label }>
}

// After (영어 키)
characteristics: {
  "PERSONALITY": Array<{ id, label, key }>,
  "DATING_STYLE": Array<{ id, label, key }>,
  "INTERESTS": Array<{ id, label, key }>
}
```

---

## 📝 영향받는 API 상세 명세

### API 1: 나이 선호도

#### Endpoint
```
GET /api/preferences/age
```

#### Request Headers
```http
Accept-Language: ko-KR  (선택 - 미사용)
```

#### Response (기존 필드 유지 + 새 필드 추가)

```typescript
{
  "typeName": "선호 나이대",        // deprecated (호환성)
  "typeKey": "AGE_PREFERENCE",     // NEW!
  "options": [
    {
      "id": "1",
      "displayName": "동갑",       // deprecated (호환성)
      "key": "SAME_AGE"            // NEW!
    },
    {
      "id": "2",
      "displayName": "연하",
      "key": "YOUNGER"
    },
    {
      "id": "3",
      "displayName": "연상",
      "key": "OLDER"
    },
    {
      "id": "4",
      "displayName": "상관없음",
      "key": "ANY"
    }
  ]
}
```

#### Key Mapping (제안)

| displayName | key | 설명 |
|------------|-----|------|
| 동갑 | `SAME_AGE` | 같은 나이 |
| 연하 | `YOUNGER` | 더 어린 |
| 연상 | `OLDER` | 더 나이 많은 |
| 상관없음 | `ANY` | 제한 없음 |

---

### API 2: 문신 선호도

#### Endpoint
```
GET /api/preferences/tattoo
```

#### Response

```typescript
{
  "typeName": "문신 선호도",
  "typeKey": "TATTOO_PREFERENCE",
  "options": [
    {
      "id": "1",
      "displayName": "문신 없음",
      "key": "NO_TATTOO"
    },
    {
      "id": "2",
      "displayName": "작은 문신",
      "key": "SMALL_TATTOO"
    },
    {
      "id": "3",
      "displayName": "문신 O",
      "key": "HAS_TATTOO"
    }
  ]
}
```

#### Key Mapping

| displayName | key | 설명 |
|------------|-----|------|
| 문신 없음 | `NO_TATTOO` | 문신 전혀 없음 |
| 작은 문신 | `SMALL_TATTOO` | 작고 눈에 띄지 않는 문신 |
| 문신 O | `HAS_TATTOO` | 눈에 띄는 문신 있음 |

---

### API 3: 파트너 상세 정보

#### Endpoint
```
GET /api/partner/:id
```

#### 현재 Response

```json
{
  "id": "partner-123",
  "name": "홍길동",
  "characteristics": {
    "성격": [
      { "id": "p1", "label": "활발한" },
      { "id": "p2", "label": "차분한" }
    ],
    "연애 스타일": [
      { "id": "d1", "label": "로맨틱" }
    ],
    "관심사": [
      { "id": "i1", "label": "운동" },
      { "id": "i2", "label": "영화" }
    ]
  }
}
```

#### 제안 Response ✅

```json
{
  "id": "partner-123",
  "name": "홍길동",
  "characteristics": {
    "PERSONALITY": [              // ← 영어 키로 변경!
      {
        "id": "p1",
        "label": "활발한",        // deprecated
        "key": "ENERGETIC"        // NEW!
      },
      {
        "id": "p2",
        "label": "차분한",
        "key": "CALM"
      }
    ],
    "DATING_STYLE": [
      {
        "id": "d1",
        "label": "로맨틱",
        "key": "ROMANTIC"
      }
    ],
    "INTERESTS": [
      {
        "id": "i1",
        "label": "운동",
        "key": "SPORTS"
      },
      {
        "id": "i2",
        "label": "영화",
        "key": "MOVIES"
      }
    ]
  }
}
```

#### Characteristics Key Mapping

**카테고리 키**:

| 한글 키 | 영어 키 | 설명 |
|--------|--------|------|
| 성격 | `PERSONALITY` | 성격 특성 |
| 연애 스타일 | `DATING_STYLE` | 데이트 선호 스타일 |
| 관심사 | `INTERESTS` | 취미 및 관심사 |

**옵션 키 예시** (실제 값은 DB 기준):

| 카테고리 | label (한글) | key (영어) |
|---------|-------------|-----------|
| PERSONALITY | 활발한 | `ENERGETIC` |
| PERSONALITY | 차분한 | `CALM` |
| PERSONALITY | 유머러스한 | `HUMOROUS` |
| DATING_STYLE | 로맨틱 | `ROMANTIC` |
| DATING_STYLE | 액티브 | `ACTIVE` |
| INTERESTS | 운동 | `SPORTS` |
| INTERESTS | 영화 | `MOVIES` |
| INTERESTS | 음악 | `MUSIC` |

---

## 🔧 구현 가이드 (백엔드)

### Step 1: DB 스키마 수정

```sql
-- 옵션 테이블에 key 컬럼 추가
ALTER TABLE preference_options ADD COLUMN `key` VARCHAR(50);

-- 기존 데이터 마이그레이션
UPDATE preference_options SET `key` = 'SAME_AGE' WHERE display_name = '동갑';
UPDATE preference_options SET `key` = 'YOUNGER' WHERE display_name = '연하';
UPDATE preference_options SET `key` = 'OLDER' WHERE display_name = '연상';

-- characteristics 카테고리 매핑
UPDATE characteristic_categories SET `key` = 'PERSONALITY' WHERE name = '성격';
UPDATE characteristic_categories SET `key` = 'DATING_STYLE' WHERE name = '연애 스타일';
UPDATE characteristic_categories SET `key` = 'INTERESTS' WHERE name = '관심사';
```

### Step 2: API 응답 수정

```typescript
// Before
{
  typeName: option.typeName,
  options: option.options.map(o => ({
    id: o.id,
    displayName: o.displayName
  }))
}

// After
{
  typeName: option.typeName,
  typeKey: option.typeKey,        // NEW!
  options: option.options.map(o => ({
    id: o.id,
    displayName: o.displayName,   // 호환성 유지
    key: o.key                    // NEW!
  }))
}
```

### Step 3: 점진적 롤아웃

**Phase 1**: `key` 필드 추가 (호환성 유지)
- 기존 클라이언트: `displayName` 계속 사용
- 새 클라이언트: `key` 사용

**Phase 2**: 클라이언트 마이그레이션
- 모든 클라이언트가 `key` 사용 확인

**Phase 3**: `displayName` deprecated 표시
- 6개월 후 제거 예정 공지

**Phase 4**: `displayName` 제거 (선택)
- 완전 마이그레이션 후

---

## 📋 Key 값 전체 목록

### AGE_PREFERENCE Keys

```typescript
enum AgePreferenceKey {
  SAME_AGE = "SAME_AGE",      // 동갑
  YOUNGER = "YOUNGER",         // 연하
  OLDER = "OLDER",             // 연상
  ANY = "ANY",                 // 상관없음
}
```

### TATTOO_PREFERENCE Keys

```typescript
enum TattooPreferenceKey {
  NO_TATTOO = "NO_TATTOO",         // 문신 없음
  SMALL_TATTOO = "SMALL_TATTOO",   // 작은 문신
  HAS_TATTOO = "HAS_TATTOO",       // 문신 O
}
```

### DRINKING_PREFERENCE Keys (참고)

```typescript
enum DrinkingPreferenceKey {
  NEVER = "NEVER",                  // 전혀 안 마셔요
  RARELY = "RARELY",                // 거의 안 마셔요
  OCCASIONALLY = "OCCASIONALLY",    // 가끔 마셔요
  OFTEN = "OFTEN",                  // 자주 마셔요
  VERY_OFTEN = "VERY_OFTEN",       // 매우 자주 마셔요
}
```

### SMOKING_PREFERENCE Keys (참고)

```typescript
enum SmokingPreferenceKey {
  NON_SMOKER = "NON_SMOKER",       // 비흡연
  E_CIGARETTE = "E_CIGARETTE",     // 전자담배
  SMOKER = "SMOKER",               // 흡연
}
```

### PERSONALITY Keys (예시 - DB 기준으로 확장)

```typescript
enum PersonalityKey {
  ENERGETIC = "ENERGETIC",         // 활발한
  CALM = "CALM",                   // 차분한
  HUMOROUS = "HUMOROUS",           // 유머러스한
  SERIOUS = "SERIOUS",             // 진지한
  OUTGOING = "OUTGOING",           // 외향적인
  INTROVERTED = "INTROVERTED",     // 내향적인
  // ... 기타
}
```

### DATING_STYLE Keys (예시)

```typescript
enum DatingStyleKey {
  ROMANTIC = "ROMANTIC",           // 로맨틱
  ACTIVE = "ACTIVE",               // 액티브
  CASUAL = "CASUAL",               // 캐주얼
  CULTURAL = "CULTURAL",           // 문화적
  // ... 기타
}
```

### INTERESTS Keys (예시)

```typescript
enum InterestKey {
  SPORTS = "SPORTS",               // 운동
  MOVIES = "MOVIES",               // 영화
  MUSIC = "MUSIC",                 // 음악
  TRAVEL = "TRAVEL",               // 여행
  READING = "READING",             // 독서
  COOKING = "COOKING",             // 요리
  GAMING = "GAMING",               // 게임
  // ... 기타
}
```

---

## 🧪 테스트 시나리오

### 테스트 1: 나이 선호도 선택

**Request**:
```http
GET /api/preferences/age
```

**Expected Response**:
```json
{
  "typeKey": "AGE_PREFERENCE",
  "options": [
    { "id": "1", "displayName": "동갑", "key": "SAME_AGE" },
    { "id": "2", "displayName": "연하", "key": "YOUNGER" },
    { "id": "3", "displayName": "연상", "key": "OLDER" }
  ]
}
```

**클라이언트 동작**:
- 한국어: "동갑" 표시
- 일본어: "同い年" 표시
- 영어: "Same Age" 표시

### 테스트 2: 파트너 정보 조회

**Request**:
```http
GET /api/partner/123
```

**Expected Response**:
```json
{
  "characteristics": {
    "PERSONALITY": [
      { "id": "p1", "label": "활발한", "key": "ENERGETIC" }
    ]
  }
}
```

**클라이언트 동작**:
- `characteristics["PERSONALITY"]` 접근 ✅
- `item.key` 사용하여 번역: t(`characteristics.energetic`)
- 한국어: "활발한" / 일본어: "活発" / 영어: "Energetic"

---

## ⚡ 빠른 시작 (백엔드 개발자용)

### 1단계: DB 마이그레이션 스크립트 작성

```sql
-- migration_add_i18n_keys.sql

-- 1. 컬럼 추가
ALTER TABLE preference_options ADD COLUMN `key` VARCHAR(50);
ALTER TABLE preference_types ADD COLUMN `type_key` VARCHAR(50);
ALTER TABLE characteristic_categories ADD COLUMN `category_key` VARCHAR(50);
ALTER TABLE characteristic_options ADD COLUMN `option_key` VARCHAR(50);

-- 2. 나이 선호도 key 설정
UPDATE preference_options
SET `key` = CASE display_name
  WHEN '동갑' THEN 'SAME_AGE'
  WHEN '연하' THEN 'YOUNGER'
  WHEN '연상' THEN 'OLDER'
  WHEN '상관없음' THEN 'ANY'
  ELSE NULL
END
WHERE type_id = (SELECT id FROM preference_types WHERE name = '나이');

-- 3. 문신 선호도 key 설정
UPDATE preference_options
SET `key` = CASE display_name
  WHEN '문신 없음' THEN 'NO_TATTOO'
  WHEN '작은 문신' THEN 'SMALL_TATTOO'
  WHEN '문신 O' THEN 'HAS_TATTOO'
  ELSE NULL
END
WHERE type_id = (SELECT id FROM preference_types WHERE name = '문신');

-- 4. Characteristics 카테고리
UPDATE characteristic_categories
SET `category_key` = CASE name
  WHEN '성격' THEN 'PERSONALITY'
  WHEN '연애 스타일' THEN 'DATING_STYLE'
  WHEN '관심사' THEN 'INTERESTS'
  ELSE NULL
END;

-- 5. NOT NULL 제약 추가 (데이터 확인 후)
-- ALTER TABLE preference_options MODIFY `key` VARCHAR(50) NOT NULL;
```

### 2단계: API 응답 수정

```typescript
// services/preference.service.ts

// Before
async getAgePreferences() {
  const prefs = await db.preferences.findByType('age');
  return {
    typeName: prefs.typeName,
    options: prefs.options.map(o => ({
      id: o.id,
      displayName: o.displayName
    }))
  };
}

// After
async getAgePreferences() {
  const prefs = await db.preferences.findByType('age');
  return {
    typeName: prefs.typeName,        // deprecated (호환성)
    typeKey: prefs.typeKey,          // NEW!
    options: prefs.options.map(o => ({
      id: o.id,
      displayName: o.displayName,    // deprecated (호환성)
      key: o.key                     // NEW!
    }))
  };
}
```

### 3단계: 파트너 API 수정

```typescript
// services/partner.service.ts

// Before
async getPartnerDetails(id: string) {
  const partner = await db.partners.findById(id);
  const characteristics = await db.characteristics.findByPartnerId(id);

  return {
    ...partner,
    characteristics: {
      "성격": characteristics.filter(c => c.category === '성격'),
      "연애 스타일": characteristics.filter(c => c.category === '연애 스타일'),
      "관심사": characteristics.filter(c => c.category === '관심사')
    }
  };
}

// After
async getPartnerDetails(id: string) {
  const partner = await db.partners.findById(id);
  const characteristics = await db.characteristics.findByPartnerId(id);

  // 카테고리별 그룹핑 (영어 키 사용)
  const grouped = {};
  characteristics.forEach(char => {
    const categoryKey = char.category.categoryKey;  // "PERSONALITY"
    if (!grouped[categoryKey]) grouped[categoryKey] = [];

    grouped[categoryKey].push({
      id: char.id,
      label: char.label,              // deprecated
      key: char.optionKey             // NEW! "ENERGETIC"
    });
  });

  return {
    ...partner,
    characteristics: grouped  // { "PERSONALITY": [...], "DATING_STYLE": [...] }
  };
}
```

---

## 📊 전체 영향 범위 매트릭스

| API | 현재 키 | 제안 키 | 영향 |
|-----|---------|---------|------|
| `/api/preferences/age` | - | `AGE_PREFERENCE` | Low |
| `/api/preferences/age` options | `displayName: "동갑"` | `key: "SAME_AGE"` | Medium |
| `/api/preferences/tattoo` | - | `TATTOO_PREFERENCE` | Low |
| `/api/preferences/tattoo` options | `displayName: "문신 없음"` | `key: "NO_TATTOO"` | Medium |
| `/api/partner/:id` | `characteristics["성격"]` | `characteristics["PERSONALITY"]` | **High** |
| `/api/partner/:id` items | `label: "활발한"` | `key: "ENERGETIC"` | **High** |

---

## ⏱️ 예상 작업 시간

### 백엔드

| 작업 | 시간 |
|------|------|
| DB 마이그레이션 스크립트 작성 | 30분 |
| API 응답 수정 (3개 엔드포인트) | 1시간 |
| 테스트 | 30분 |
| 배포 | 20분 |
| **총계** | **2시간 20분** |

### 프론트엔드 (백엔드 완료 후)

| 작업 | 시간 |
|------|------|
| 11개 문자열 i18n 마이그레이션 | 15분 |
| 테스트 (ko/ja 전환) | 15분 |
| **총계** | **30분** |

---

## 🚀 배포 전략

### Phase 1: 백엔드 배포 (호환성 유지)
```
✅ `key` 필드 추가
✅ 기존 `displayName` 유지
→ 기존 클라이언트: 정상 작동
→ 새 클라이언트: `key` 사용 가능
```

### Phase 2: 프론트엔드 배포
```
✅ `key` 필드 사용으로 변경
✅ i18n 적용 (11개 문자열)
→ 다국어 지원 완성!
```

### Phase 3: Cleanup (6개월 후)
```
⏳ `displayName` deprecated
⏳ 사용량 모니터링
⏳ 완전 제거 여부 결정
```

---

## 📞 커뮤니케이션

### 백엔드 팀에 전달할 내용

```markdown
안녕하세요! 프론트엔드 i18n 작업 중입니다.

**요청 사항**: API 응답에 영어 key 필드 추가

**영향 API**:
- GET /api/preferences/age
- GET /api/preferences/tattoo
- GET /api/partner/:id

**변경 내용**:
- 기존 필드 유지 (호환성)
- 새로운 `key` 필드 추가 (영어 상수)
- 예: { displayName: "동갑", key: "SAME_AGE" }

**상세 명세**: docs/BACKEND_I18N_API_SPEC.md 참고
**예상 작업**: 2-3시간
**긴급도**: 중간 (현재는 우회 가능)

협의 가능한 시간 알려주세요!
```

---

## 📄 체크리스트

### 백엔드 작업
- [ ] DB 스키마 수정
- [ ] Key 매핑 데이터 입력
- [ ] API 응답 수정
- [ ] 테스트 작성
- [ ] Staging 배포
- [ ] Production 배포

### 프론트엔드 작업 (백엔드 완료 후)
- [ ] 11개 파일 수정
- [ ] i18n 적용
- [ ] 테스트 (ko/ja 전환)
- [ ] 커밋 & 배포

---

**다음 액션**: 이 문서를 백엔드 팀에 전달하시겠어요? 🚀
