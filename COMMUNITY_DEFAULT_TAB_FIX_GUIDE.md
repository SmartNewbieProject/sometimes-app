# 커뮤니티 기본 탭 '공지' → '홈' 변경 가이드

## 문제 분석

현재 커뮤니티에 들어가면 '공지' 탭이 기본으로 설정되어 있으나, '홈' 탭을 기본으로 변경해야 합니다.

## 원인 파악

### 1. **카테고리 로딩 로직 분석**

**파일**: `src/features/community/hooks/use-categories.tsx`

```typescript
// 현재 코드 (22-25행)
useEffect(() => {
  if (category) return;
  changeCategory(categories[0]?.code);  // 첫 번째 카테고리를 기본으로 설정
}, [queryProps.isFetched]);
```

**문제점**: 
- `categories[0]`이 서버에서 반환하는 첫 번째 카테고리(공지)를 선택
- '홈' 탭은 수동으로 추가되므로 기본 선택되지 않음

### 2. **홈 탭 추가 로직**

**파일**: `src/features/community/ui/category-list/index.tsx`

```typescript
// 현재 코드 (37-40행)
const augmentedCategories = useMemo(
  () => [{ code: HOME_CODE, displayName: "홈" } as const, ...categories],
  [categories]
);
```

**홈 탭 정의** (23행):
```typescript
const HOME_CODE = "__home__";
```

## 해결책

### 해결책 1: use-categories.tsx 수정 (권장)

**파일**: `src/features/community/hooks/use-categories.tsx`

```typescript
import { useQuery } from "@tanstack/react-query";
import apis from "../apis";
import { create } from "zustand";
import { useEffect } from "react";

const HOME_CODE = "__home__"; // 홈 탭 코드 상수 추가

interface State {
  category?: string;
  changeCategory: (categories: string) => void;
}

const useStore = create<State>(set => ({
  changeCategory: (category) => set({ category }),
}));

export const useCategory = () => {
  const { category, changeCategory } = useStore();
  const { data: categories = [], ...queryProps } = useQuery({
    queryKey: ['category-list'],
    queryFn: apis.articles.getCategoryList,
  });

  useEffect(() => {
    if (category) return;
    // 홈 탭을 기본으로 설정
    changeCategory(HOME_CODE);
  }, [queryProps.isFetched]);

  return { categories, currentCategory: category, changeCategory, ...queryProps };
};
```

### 해결책 2: 더 안전한 방법 (조건부 로직)

```typescript
// src/features/community/hooks/use-categories.tsx 수정
import { useQuery } from "@tanstack/react-query";
import apis from "../apis";
import { create } from "zustand";
import { useEffect } from "react";

const HOME_CODE = "__home__";

interface State {
  category?: string;
  changeCategory: (categories: string) => void;
}

const useStore = create<State>(set => ({
  changeCategory: (category) => set({ category }),
}));

export const useCategory = () => {
  const { category, changeCategory } = useStore();
  const { data: categories = [], ...queryProps } = useQuery({
    queryKey: ['category-list'],
    queryFn: apis.articles.getCategoryList,
  });

  useEffect(() => {
    if (category) return;
    
    // 데이터가 로드된 후에만 실행
    if (queryProps.isFetched) {
      // 항상 홈 탭을 기본으로 설정
      changeCategory(HOME_CODE);
    }
  }, [queryProps.isFetched, category, changeCategory]);

  return { categories, currentCategory: category, changeCategory, ...queryProps };
};
```

### 해결책 3: 초기값 설정 (Store 레벨)

```typescript
// src/features/community/hooks/use-categories.tsx 수정
import { useQuery } from "@tanstack/react-query";
import apis from "../apis";
import { create } from "zustand";
import { useEffect } from "react";

const HOME_CODE = "__home__";

interface State {
  category: string; // optional 제거
  changeCategory: (categories: string) => void;
}

const useStore = create<State>(set => ({
  category: HOME_CODE, // 초기값으로 홈 탭 설정
  changeCategory: (category) => set({ category }),
}));

export const useCategory = () => {
  const { category, changeCategory } = useStore();
  const { data: categories = [], ...queryProps } = useQuery({
    queryKey: ['category-list'],
    queryFn: apis.articles.getCategoryList,
  });

  // useEffect 제거 또는 유지 (선택 사항)
  useEffect(() => {
    // 이미 초기값이 있으므로 이 로직은 필요 없음
  }, []);

  return { categories, currentCategory: category, changeCategory, ...queryProps };
};
```

## 추천 해결책: 해결책 1 적용

### 완성된 코드

```typescript
// src/features/community/hooks/use-categories.tsx
import { useQuery } from "@tanstack/react-query";
import apis from "../apis";
import { create } from "zustand";
import { useEffect } from "react";

const HOME_CODE = "__home__"; // 홈 탭 코드 상수 추가

interface State {
  category?: string;
  changeCategory: (categories: string) => void;
}

const useStore = create<State>(set => ({
  changeCategory: (category) => set({ category }),
}));

export const useCategory = () => {
  const { category, changeCategory } = useStore();
  const { data: categories = [], ...queryProps } = useQuery({
    queryKey: ['category-list'],
    queryFn: apis.articles.getCategoryList,
  });

  useEffect(() => {
    if (category) return;
    // 홈 탭을 기본으로 설정
    changeCategory(HOME_CODE);
  }, [queryProps.isFetched]);

  return { categories, currentCategory: category, changeCategory, ...queryProps };
};
```

## 추가 고려사항

### 1. **기존 사용자 경험 유지**

```typescript
// 사용자가 이전에 선택한 카테고리가 있다면 유지
useEffect(() => {
  if (category) return;
  
  if (queryProps.isFetched) {
    // 저장된 카테고리가 있다면 사용, 없다면 홈 탭으로
    const savedCategory = getSavedCategory(); // AsyncStorage 등에서 가져오기
    changeCategory(savedCategory || HOME_CODE);
  }
}, [queryProps.isFetched]);
```

### 2. **디버깅을 위한 로그 추가**

```typescript
useEffect(() => {
  console.log('Category loaded:', { category, isFetched: queryProps.isFetched });
  
  if (category) return;
  
  if (queryProps.isFetched) {
    console.log('Setting default category to HOME');
    changeCategory(HOME_CODE);
  }
}, [queryProps.isFetched, category, changeCategory]);
```

### 3. **타입 안전성 강화**

```typescript
// category-list/index.tsx와 상수 통일
export const HOME_CODE = "__home__" as const;

// use-categories.tsx에서 import
import { HOME_CODE } from "../ui/category-list";
```

## 테스트 방법

### 1. **수동 테스트**
1. 앱을 완전히 종료 후 재시작
2. 커뮤니티 탭으로 이동
3. '홈' 탭이 선택되어 있는지 확인

### 2. **콘솔 로그 확인**
```typescript
// 개발자 도구에서 로그 확인
console.log('Current category:', currentCategory);
// 예상 출력: "__home__"
```

### 3. **네트워크 상태 테스트**
1. 네트워크 연결 없이 앱 실행
2. 네트워크 연결 후 카테고리 로딩
3. 홈 탭이 유지되는지 확인

## 예상 결과

- ✅ 앱 시작 시 '홈' 탭이 기본으로 선택됨
- ✅ 사용자가 다른 탭을 선택했다가 돌아와도 선택 유지됨
- ✅ 카테고리 로딩 실패 시에도 홈 탭이 표시됨
- ✅ 기존 기능(탭 전환, 스크롤 등) 정상 동작

이 수정을 적용하면 커뮤니티 첫 화면에서 '홈' 탭이 기본으로 표시됩니다.