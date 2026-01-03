# Frontend 서버 데이터 매칭 i18n 적용 가이드

**백엔드 API 변경 완료 후** 프론트엔드에서 수정할 사항

**영향 파일**: 3개 파일, 11개 문자열
**예상 작업 시간**: 30분

---

## 📋 수정 대상 파일

### 1. **app/interest/age.tsx** (3개 문자열)
### 2. **app/interest/tattoo.tsx** (2개 문자열)
### 3. **app/partner/view/[id].tsx** (6개 문자열)

---

## 🔧 수정 사항 상세

### 파일 1: `app/interest/age.tsx`

#### Before (현재 - 한글 하드코딩)

```typescript
const loaded = preferences.options.map((option) => ({
  value: option.id,
  label: option.displayName,  // 서버 한글 그대로
  image: (() => {
    switch (option.displayName) {  // ← 한글 비교
      case "동갑":
        return require("@assets/images/age/same.png");
      case "연하":
        return require("@assets/images/age/under.png");
      case "연상":
        return require("@assets/images/age/high.png");
      default:
        return require("@assets/images/age/nothing.png");
    }
  })(),
}));
```

#### After (수정 - key 기반 + i18n) ✅

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

const loaded = preferences.options.map((option) => ({
  value: option.id,
  label: t(`apps.interest.age.${option.key.toLowerCase()}`),  // ← i18n!
  image: (() => {
    switch (option.key) {  // ← key로 비교 (영어 ID)
      case "SAME_AGE":
        return require("@assets/images/age/same.png");
      case "YOUNGER":
        return require("@assets/images/age/under.png");
      case "OLDER":
        return require("@assets/images/age/high.png");
      default:
        return require("@assets/images/age/nothing.png");
    }
  })(),
}));
```

#### JSON 파일 추가

```json
// src/shared/libs/locales/ko/apps/interest.json
{
  "age": {
    "same_age": "동갑",
    "younger": "연하",
    "older": "연상",
    "any": "상관없음"
  }
}

// src/shared/libs/locales/ja/apps/interest.json
{
  "age": {
    "same_age": "同い年",
    "younger": "年下",
    "older": "年上",
    "any": "どちらでも"
  }
}

// src/shared/libs/locales/en/apps/interest.json
{
  "age": {
    "same_age": "Same Age",
    "younger": "Younger",
    "older": "Older",
    "any": "Any"
  }
}
```

---

### 파일 2: `app/interest/tattoo.tsx`

#### Before (현재)

```typescript
const updatedOptions = preferences.options.map((option) => {
  if (option.displayName === "문신 없음") {
    return option;
  } else if (option.displayName === "작은 문신") {
    return { ...option, displayName: "작은 문신" };
  } else {
    return option;
  }
});
```

#### After (수정) ✅

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

const updatedOptions = preferences.options.map((option) => ({
  ...option,
  displayName: t(`apps.interest.tattoo.${option.key.toLowerCase()}`),  // ← i18n!
}));
```

#### JSON 파일 추가

```json
// locales/ko/apps/interest.json
{
  "tattoo": {
    "no_tattoo": "문신 없음",
    "small_tattoo": "작은 문신",
    "has_tattoo": "문신 O"
  }
}

// locales/ja/apps/interest.json
{
  "tattoo": {
    "no_tattoo": "タトゥーなし",
    "small_tattoo": "小さいタトゥー",
    "has_tattoo": "タトゥーあり"
  }
}
```

---

### 파일 3: `app/partner/view/[id].tsx`

#### Before (현재 - 라인 434-436)

```typescript
import { parser } from '@/src/shared/libs/parser';

<MatchingReasonCard
  reasons={matchReasonsData.reasons.map((r) => r.description)}
  keywords={[
    ...(parser.getMultipleCharacteristicsOptions(
      ["성격"],  // ← 한글 키
      partner.characteristics
    )["성격"]?.map((c: any) => c.label) || []),  // ← 한글 키, 한글 label

    ...(parser.getMultipleCharacteristicsOptions(
      ["연애 스타일"],  // ← 한글 키
      partner.characteristics
    )["연애 스타일"]?.map((c: any) => c.label) || []),

    ...(parser.getMultipleCharacteristicsOptions(
      ["관심사"],  // ← 한글 키
      partner.characteristics
    )["관심사"]?.map((c: any) => c.label) || []),
  ]}
/>
```

#### After (수정) ✅

```typescript
import { useTranslation } from 'react-i18next';
import { parser } from '@/src/shared/libs/parser';

const { t } = useTranslation();

// Helper function
const translateCharacteristics = (
  items: Array<{ id: string; label: string; key: string }> | undefined
) => {
  return items?.map((c) =>
    t(`apps.partner.characteristics.${c.key.toLowerCase()}`)
  ) || [];
};

<MatchingReasonCard
  reasons={matchReasonsData.reasons.map((r) => r.description)}
  keywords={[
    ...translateCharacteristics(
      parser.getMultipleCharacteristicsOptions(
        ["PERSONALITY"],  // ← 영어 키로 변경!
        partner.characteristics
      )["PERSONALITY"]
    ),

    ...translateCharacteristics(
      parser.getMultipleCharacteristicsOptions(
        ["DATING_STYLE"],  // ← 영어 키
        partner.characteristics
      )["DATING_STYLE"]
    ),

    ...translateCharacteristics(
      parser.getMultipleCharacteristicsOptions(
        ["INTERESTS"],  // ← 영어 키
        partner.characteristics
      )["INTERESTS"]
    ),
  ]}
/>
```

#### parser.ts 수정 필요 확인

```typescript
// src/shared/libs/parser.ts 확인
// getMultipleCharacteristicsOptions 함수가 영어 키를 지원하는지 확인 필요

// 만약 수정 필요하면:
export function getMultipleCharacteristicsOptions(
  keys: string[],  // ["PERSONALITY", "DATING_STYLE"]
  characteristics: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};

  keys.forEach(key => {
    result[key] = characteristics[key] || [];
  });

  return result;
}
```

#### JSON 파일 추가 (예시 - 실제 값은 서버 데이터 기준)

```json
// locales/ko/apps/partner.json
{
  "characteristics": {
    // PERSONALITY
    "energetic": "활발한",
    "calm": "차분한",
    "humorous": "유머러스한",
    "serious": "진지한",
    "outgoing": "외향적인",
    "introverted": "내향적인",

    // DATING_STYLE
    "romantic": "로맨틱",
    "active": "액티브",
    "casual": "캐주얼",
    "cultural": "문화적",

    // INTERESTS
    "sports": "운동",
    "movies": "영화",
    "music": "음악",
    "travel": "여행",
    "reading": "독서",
    "cooking": "요리",
    "gaming": "게임"
  }
}

// locales/ja/apps/partner.json
{
  "characteristics": {
    "energetic": "活発",
    "calm": "落ち着いた",
    "humorous": "ユーモラス",
    "serious": "真面目",
    "outgoing": "外向的",
    "introverted": "内向的",

    "romantic": "ロマンティック",
    "active": "アクティブ",
    "casual": "カジュアル",
    "cultural": "文化的",

    "sports": "スポーツ",
    "movies": "映画",
    "music": "音楽",
    "travel": "旅行",
    "reading": "読書",
    "cooking": "料理",
    "gaming": "ゲーム"
  }
}
```

---

## 🔍 타입 정의 수정

### types/preference.ts (또는 관련 타입 파일)

```typescript
// Before
interface PreferenceOption {
  id: string;
  displayName: string;
}

// After
interface PreferenceOption {
  id: string;
  displayName: string;  // @deprecated - 호환성용, key 사용 권장
  key: string;          // NEW! 영어 ID (예: "SAME_AGE")
}

interface PreferenceType {
  typeName: string;     // @deprecated
  typeKey: string;      // NEW! (예: "AGE_PREFERENCE")
  options: PreferenceOption[];
}

// Partner characteristics 타입
interface CharacteristicItem {
  id: string;
  label: string;        // @deprecated
  key: string;          // NEW! (예: "ENERGETIC")
}

interface Partner {
  id: string;
  name: string;
  characteristics: {
    PERSONALITY?: CharacteristicItem[];      // 영어 키로 변경!
    DATING_STYLE?: CharacteristicItem[];
    INTERESTS?: CharacteristicItem[];

    // 호환성용 (deprecated)
    "성격"?: CharacteristicItem[];
    "연애 스타일"?: CharacteristicItem[];
    "관심사"?: CharacteristicItem[];
  };
}
```

---

## 📝 완전한 수정 체크리스트

### Step 1: 타입 정의 업데이트

- [ ] `src/features/interest/types.ts` - PreferenceOption에 `key` 필드 추가
- [ ] `src/types/partner.ts` - Partner characteristics 구조 수정
- [ ] `src/types/characteristics.ts` - CharacteristicItem에 `key` 필드 추가

### Step 2: API 호출 코드 수정 (필요시)

대부분 자동으로 처리되지만, 명시적 타입 단언이 있다면 수정:

```typescript
// Before
const response = await api.get<{ options: Array<{ id: string, displayName: string }> }>(...)

// After
const response = await api.get<{ options: Array<{ id: string, displayName: string, key: string }> }>(...)
```

### Step 3: 파일별 수정

#### 3.1 app/interest/age.tsx

```typescript
// useTranslation import 확인 (이미 있음)
import { useTranslation } from 'react-i18next';

export default function AgeSelectionScreen() {
  const { t } = useTranslation();  // ← 확인

  // ... existing code ...

  useEffect(() => {
    if (preferences.typeName === "") {
      return;
    }

    const loaded = preferences.options.map((option) => ({
      value: option.id,
      label: t(`apps.interest.age.${option.key.toLowerCase()}`),  // ← 수정!
      image: (() => {
        switch (option.key) {  // ← displayName → key
          case "SAME_AGE":
            return require("@assets/images/age/same.png");
          case "YOUNGER":
            return require("@assets/images/age/under.png");
          case "OLDER":
            return require("@assets/images/age/high.png");
          default:
            return require("@assets/images/age/nothing.png");
        }
      })(),
    })) as AgeOptionData[];

    setOptions(loaded);
  }, [preferences, t]);  // ← dependency 추가
}
```

#### 3.2 app/interest/tattoo.tsx

```typescript
import { useTranslation } from 'react-i18next';

export default function TattooSelectionScreen() {
  const { t } = useTranslation();

  // ... existing code ...

  useEffect(() => {
    if (preferences.typeName === "") return;

    // 모든 옵션에 i18n 적용
    const updatedOptions = preferences.options.map((option) => ({
      ...option,
      displayName: t(`apps.interest.tattoo.${option.key.toLowerCase()}`),  // ← i18n!
    }));

    setOptions(updatedOptions as TattooOptionData[]);
  }, [preferences, t]);
}
```

#### 3.3 app/partner/view/[id].tsx

```typescript
import { useTranslation } from 'react-i18next';

export default function PartnerViewPage() {
  const { t } = useTranslation();

  // ... existing code ...

  // Helper function 추가
  const translateCharacteristic = (key: string): string => {
    return t(`apps.partner.characteristics.${key.toLowerCase()}`);
  };

  return (
    <View>
      {/* ... other code ... */}

      {matchReasonsData?.reasons && matchReasonsData.reasons.length > 0 && (
        <MatchingReasonCard
          reasons={matchReasonsData.reasons.map((r) => r.description)}
          keywords={[
            // 성격
            ...(parser.getMultipleCharacteristicsOptions(
              ["PERSONALITY"],  // ← 영어 키!
              partner.characteristics
            )["PERSONALITY"]?.map((c: any) => translateCharacteristic(c.key)) || []),

            // 연애 스타일
            ...(parser.getMultipleCharacteristicsOptions(
              ["DATING_STYLE"],  // ← 영어 키!
              partner.characteristics
            )["DATING_STYLE"]?.map((c: any) => translateCharacteristic(c.key)) || []),

            // 관심사
            ...(parser.getMultipleCharacteristicsOptions(
              ["INTERESTS"],  // ← 영어 키!
              partner.characteristics
            )["INTERESTS"]?.map((c: any) => translateCharacteristic(c.key)) || []),
          ]}
        />
      )}
    </View>
  );
}
```

---

## 📄 필요한 JSON 파일

### 1. locales/ko/apps/interest.json

```json
{
  "age": {
    "same_age": "동갑",
    "younger": "연하",
    "older": "연상",
    "any": "상관없음"
  },
  "tattoo": {
    "no_tattoo": "문신 없음",
    "small_tattoo": "작은 문신",
    "has_tattoo": "문신 O"
  }
}
```

### 2. locales/ja/apps/interest.json

```json
{
  "age": {
    "same_age": "同い年",
    "younger": "年下",
    "older": "年上",
    "any": "どちらでも"
  },
  "tattoo": {
    "no_tattoo": "タトゥーなし",
    "small_tattoo": "小さいタトゥー",
    "has_tattoo": "タトゥーあり"
  }
}
```

### 3. locales/en/apps/interest.json

```json
{
  "age": {
    "same_age": "Same Age",
    "younger": "Younger",
    "older": "Older",
    "any": "Any"
  },
  "tattoo": {
    "no_tattoo": "No Tattoo",
    "small_tattoo": "Small Tattoo",
    "has_tattoo": "Has Tattoo"
  }
}
```

### 4. locales/ko/apps/partner.json (신규 또는 추가)

**실제 characteristics 값은 서버 데이터를 확인 후 작성 필요!**

```json
{
  "characteristics": {
    // PERSONALITY - 성격 (예시)
    "energetic": "활발한",
    "calm": "차분한",
    "humorous": "유머러스한",
    "serious": "진지한",
    "outgoing": "외향적인",
    "introverted": "내향적인",
    "optimistic": "긍정적인",
    "realistic": "현실적인",

    // DATING_STYLE - 연애 스타일 (예시)
    "romantic": "로맨틱",
    "active": "액티브",
    "casual": "캐주얼",
    "cultural": "문화적",
    "adventurous": "모험적",
    "homebody": "집순이/집돌이",

    // INTERESTS - 관심사 (예시)
    "sports": "운동",
    "movies": "영화",
    "music": "음악",
    "travel": "여행",
    "reading": "독서",
    "cooking": "요리",
    "gaming": "게임",
    "art": "예술",
    "fashion": "패션",
    "food": "맛집탐방"
  }
}
```

### 5. locales/ja/apps/partner.json

```json
{
  "characteristics": {
    // PERSONALITY
    "energetic": "活発",
    "calm": "落ち着いた",
    "humorous": "ユーモラス",
    "serious": "真面目",
    "outgoing": "外向的",
    "introverted": "内向的",
    "optimistic": "ポジティブ",
    "realistic": "現実的",

    // DATING_STYLE
    "romantic": "ロマンティック",
    "active": "アクティブ",
    "casual": "カジュアル",
    "cultural": "文化的",
    "adventurous": "冒険的",
    "homebody": "インドア派",

    // INTERESTS
    "sports": "スポーツ",
    "movies": "映画",
    "music": "音楽",
    "travel": "旅行",
    "reading": "読書",
    "cooking": "料理",
    "gaming": "ゲーム",
    "art": "アート",
    "fashion": "ファッション",
    "food": "グルメ"
  }
}
```

---

## 🔍 parser.ts 확인 및 수정

### 확인 사항

```typescript
// src/shared/libs/parser.ts
// 이 함수가 영어 키를 지원하는지 확인

export function getMultipleCharacteristicsOptions(
  keys: string[],
  characteristics: Record<string, any>
): Record<string, any> {
  // 구현 확인 필요
}
```

### 예상되는 수정 (필요 시)

```typescript
// Before - 한글 키만 지원
export function getMultipleCharacteristicsOptions(
  keys: string[],  // ["성격"]
  characteristics: { "성격": [...] }
) {
  return { "성격": characteristics["성격"] };
}

// After - 영어 키 지원
export function getMultipleCharacteristicsOptions(
  keys: string[],  // ["PERSONALITY"]
  characteristics: { "PERSONALITY": [...] }
) {
  return { "PERSONALITY": characteristics["PERSONALITY"] };
}
```

**가능성**: parser.ts는 단순히 키로 접근만 하므로 수정 불필요할 수 있음

---

## 🧪 테스트 시나리오

### 테스트 1: 나이 선호도 (한국어)

```typescript
// 서버 응답
{ id: "1", displayName: "동갑", key: "SAME_AGE" }

// 렌더링 결과
label: "동갑" ✅  // t("apps.interest.age.same_age")
image: same.png ✅
```

### 테스트 2: 나이 선호도 (일본어)

```typescript
// 서버 응답 (동일)
{ id: "1", displayName: "동갑", key: "SAME_AGE" }

// 언어 전환: ko → ja
i18n.changeLanguage('ja');

// 렌더링 결과
label: "同い年" ✅  // t("apps.interest.age.same_age")
image: same.png ✅
```

### 테스트 3: 파트너 특성 (일본어)

```typescript
// 서버 응답
{
  characteristics: {
    "PERSONALITY": [
      { id: "p1", label: "활발한", key: "ENERGETIC" }
    ]
  }
}

// 일본어 렌더링
keywords: ["活発"] ✅  // t("apps.partner.characteristics.energetic")
```

---

## ⚠️ 호환성 처리 (중요!)

### Fallback 패턴 (서버 배포 전/후 모두 작동)

```typescript
// app/interest/age.tsx
const loaded = preferences.options.map((option) => {
  // 서버에서 key가 있으면 사용, 없으면 displayName 기반 매핑
  const optionKey = option.key || getKeyFromDisplayName(option.displayName);

  return {
    value: option.id,
    label: t(`apps.interest.age.${optionKey.toLowerCase()}`),
    image: getAgeImage(optionKey),
  };
});

// Helper: displayName → key 매핑 (임시)
function getKeyFromDisplayName(displayName: string): string {
  const mapping: Record<string, string> = {
    "동갑": "SAME_AGE",
    "연하": "YOUNGER",
    "연상": "OLDER",
    "상관없음": "ANY",
  };
  return mapping[displayName] || "ANY";
}
```

**장점**:
- ✅ 백엔드 배포 전에도 작동
- ✅ 점진적 마이그레이션 가능

---

## 🚀 실행 순서

### 백엔드 완료 전 (지금 가능)

1. **JSON 번역 파일 준비** ✅
   ```bash
   # 이미 작성된 명세서 기반으로 JSON 생성 가능
   # locales/ko/apps/interest.json
   # locales/ko/apps/partner.json
   ```

2. **타입 정의 추가**
   ```typescript
   // PreferenceOption에 key?: string 추가
   ```

3. **Fallback 함수 작성** (옵션)
   ```typescript
   // getKeyFromDisplayName() 함수
   ```

### 백엔드 완료 후

1. **코드 수정** (30분)
   - [ ] app/interest/age.tsx
   - [ ] app/interest/tattoo.tsx
   - [ ] app/partner/view/[id].tsx

2. **테스트** (15분)
   - [ ] 한국어 정상 표시
   - [ ] 일본어 전환 테스트
   - [ ] 이미지 매칭 확인

3. **Fallback 제거** (선택)
   - [ ] getKeyFromDisplayName() 함수 제거
   - [ ] 코드 정리

---

## 📊 변경 범위 요약

### 수정 파일 (3개)

| 파일 | 변경 라인 | 난이도 |
|------|----------|--------|
| app/interest/age.tsx | ~10줄 | 쉬움 |
| app/interest/tattoo.tsx | ~5줄 | 쉬움 |
| app/partner/view/[id].tsx | ~15줄 | 보통 |

### 추가 JSON (3개)

| 파일 | 키 개수 |
|------|---------|
| locales/*/apps/interest.json | 7개 |
| locales/*/apps/partner.json | 20-30개 (서버 데이터 기준) |

### 타입 수정 (2-3개)

- PreferenceOption
- Partner
- CharacteristicItem

---

## 💡 서버 데이터 확인 방법

### characteristics 전체 옵션 확인

```bash
# 1. API 직접 호출
curl https://api.sometime.kr/api/preferences/personality | jq

# 2. 또는 앱에서 console.log
console.log('All characteristics:', partner.characteristics);

# 3. 실제 key 목록 추출
Object.entries(partner.characteristics).forEach(([category, items]) => {
  console.log(`Category: ${category}`);
  items.forEach(item => console.log(`  - ${item.label} → ${item.key || 'NEED_KEY'}`));
});
```

**출력 예시**:
```
Category: 성격
  - 활발한 → ENERGETIC
  - 차분한 → CALM
  - 유머러스한 → HUMOROUS

Category: 연애 스타일
  - 로맨틱 → ROMANTIC
  - 액티브 → ACTIVE
```

이 데이터를 기반으로 **완전한 번역 JSON 작성**

---

## 🎯 작업 순서 (백엔드 완료 후)

### 1일차: 코드 수정 (30분)

```bash
# 1. 타입 업데이트
# src/features/interest/types.ts 등

# 2. age.tsx 수정
# app/interest/age.tsx

# 3. tattoo.tsx 수정
# app/interest/tattoo.tsx

# 4. partner/view 수정
# app/partner/view/[id].tsx
```

### 2일차: JSON & 테스트 (30분)

```bash
# 1. 서버 데이터 확인
curl /api/preferences/personality
curl /api/partner/123

# 2. JSON 파일 작성
# 모든 characteristics key 기반

# 3. 테스트
npm run start
# 한국어 → 일본어 전환 확인
```

### 3일차: 정리 (15분)

```bash
# 1. Fallback 함수 제거 (있다면)
# 2. 코드 리뷰
# 3. 커밋
git commit -m "feat(i18n): 서버 데이터 매칭 i18n 적용 (11개 완료)"
```

---

## ✅ 최종 체크리스트

### 백엔드 확인사항
- [ ] API에 `key` 필드 추가됨
- [ ] `characteristics` 객체 키가 영어로 변경됨
- [ ] Staging 환경에서 응답 확인

### 프론트엔드 작업
- [ ] 타입 정의 업데이트
- [ ] app/interest/age.tsx 수정
- [ ] app/interest/tattoo.tsx 수정
- [ ] app/partner/view/[id].tsx 수정
- [ ] parser.ts 확인 (수정 필요 시)
- [ ] JSON 번역 파일 작성 (ko/ja/en)
- [ ] 테스트 (한국어)
- [ ] 테스트 (일본어 전환)
- [ ] 이미지 매칭 확인
- [ ] 커밋 & 배포

### 검증
- [ ] 나이 선호도 선택 화면
- [ ] 문신 선호도 선택 화면
- [ ] 파트너 상세 페이지 - 특성 표시
- [ ] 언어 전환 (ko ↔ ja)
- [ ] 서버 에러 시 fallback 동작

---

## 🐛 예상 이슈 & 해결

### 이슈 1: parser.ts가 한글 키만 지원

**증상**:
```typescript
characteristics["PERSONALITY"]  // undefined
characteristics["성격"]          // 정상 작동
```

**해결**:
```typescript
// parser.ts 수정 - 영어/한글 키 모두 지원
export function getMultipleCharacteristicsOptions(
  keys: string[],
  characteristics: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};

  // 호환성: 영어 키 우선, 없으면 한글 키 시도
  const KEY_MAPPING: Record<string, string> = {
    "PERSONALITY": "성격",
    "DATING_STYLE": "연애 스타일",
    "INTERESTS": "관심사",
  };

  keys.forEach(key => {
    result[key] = characteristics[key] || characteristics[KEY_MAPPING[key]] || [];
  });

  return result;
}
```

### 이슈 2: 서버에서 key가 없음

**증상**:
```typescript
option.key  // undefined
```

**해결**: Fallback 사용
```typescript
const optionKey = option.key || getKeyFromDisplayName(option.displayName);
```

### 이슈 3: 번역 키가 없음

**증상**:
```
t("apps.partner.characteristics.new_key")  // "apps.partner.characteristics.new_key" 그대로 표시
```

**해결**: 서버에서 새로운 key 발견 시 JSON에 추가
```json
{
  "characteristics": {
    "new_key": "새로운 특성"  // 추가
  }
}
```

---

## 📊 변경 전/후 비교

### Before (현재)

```typescript
❌ 문제:
- 서버: { displayName: "동갑" } (한글)
- 클라이언트: case "동갑" (하드코딩)
- 일본어 지원: 불가능

✅ 장점:
- 간단한 코드
```

### After (수정 후)

```typescript
✅ 장점:
- 서버: { key: "SAME_AGE" } (언어 독립적)
- 클라이언트: t("interest.age.same_age")
- 다국어 완벽 지원!

⚠️ 주의:
- 서버/클라이언트 협업 필요
- key 매핑 관리 필요
```

---

## 🎓 학습 포인트

### 왜 이렇게 설계해야 하나?

1. **데이터와 표현의 분리**
   - Data: `key: "SAME_AGE"` (불변)
   - Presentation: `label: t("...")` (언어별 변경)

2. **확장성**
   - 새 언어 추가 시 서버 배포 불필요
   - JSON 파일만 추가

3. **유지보수성**
   - 번역 수정 시 클라이언트만 배포
   - 서버 로직 단순화

---

**결론**: 백엔드 API 수정 완료 후, 프론트엔드는 **3개 파일, ~30줄 수정**하면 완료됩니다! ✅

이 문서를 참고하여 백엔드 완료 후 바로 작업 가능합니다! 🚀
