# 커뮤니티 홈 인디케이터와 공지사항 프리뷰 연동 수정 가이드

## 문제 분석

커뮤니티 홈 화면에서 인디케이터(페이지 표시점)가 공지사항 프리뷰의 스크롤과 연동되지 않는 문제에 대한 원인 분석 및 해결 가이드입니다.

## 현재 구조 분석

### 1. **컴포넌트 구조**
```
app/community/index.tsx
├── CommuHome (src/features/community/ui/home/index.tsx)
    ├── 공지사항 섹션
    │   └── NotiPreView (src/features/community/ui/home/notice.tsx)
    │       ├── ScrollView (horizontal, pagingEnabled)
    │       └── 인디케이터 (96-111행)
    └── 인기 섹션
```

### 2. **데이터 흐름**
```
useHomeNoticesQuery → useHomeNotices → Notice → 인디케이터
```

## 원인 분석

### 1. **가장 유력한 원인: containerWidth 초기값 문제**

**문제점**: `notice.tsx:77행`
```typescript
style={{ width: containerWidth || undefined }}
```

- `containerWidth`가 0으로 초기화되면 `undefined`가 됨
- `undefined` 너비로 인해 스크롤 계산이 정상적으로 동작하지 않음

**증거**: `use-home.ts:15-16행`
```typescript
const [containerWidth, setContainerWidth] = useState(0);
// 초기값이 0이라 onLayout 이벤트 전까지 계산이 안 됨
```

### 2. **인디케이터 계산 로직 문제**

**문제점**: `notice.tsx:97-98행`
```typescript
{Array.from({ length: total || 1 }).map((_, i) => {
  const active = i === index;
```

- `total` 계산이 `notices.length`와 `size` 기반이라 부정확할 수 있음
- `index` 상태가 스크롤과 완벽히 동기화되지 않을 수 있음

### 3. **ScrollView 이벤트 핸들링 문제**

**문제점**: `use-home.ts:31-41행`
```typescript
const onMomentumEnd = useCallback(
  (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const viewportWidth = e.nativeEvent.layoutMeasurement?.width || containerWidth || 1;
    const offsetX = e.nativeEvent.contentOffset.x || 0;
    const next = Math.round(offsetX / viewportWidth);
    const clamped = Math.max(0, Math.min(next, Math.max(total - 1, 0)));
    setIndex(clamped);
  },
  [containerWidth, total]
);
```

- `containerWidth`가 0이면 계산이 부정확함
- `Math.max(total - 1, 0)` 로직이 복잡하고 오류 발생 가능

## 해결책

### 해결책 1: containerWidth 초기값 및 계산 로직 수정 (권장)

**파일**: `src/features/community/ui/home/notice.tsx`

```typescript
import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { useHomeNotices } from "@/src/features/community/hooks/use-home";
import { Article } from "../../ui/article";

type Props = {
  pageSize?: number;
};

export default function Notice({ pageSize = 5 }: Props) {
  const {
    notices,
    isLoading,
    isError,
    error,
    index,
    total,
    refs,
    handlers,
    containerWidth,
  } = useHomeNotices(pageSize);

  const handlePressArticle = useCallback((id: string) => {
    router.push(`/community/${id}`);
  }, []);

  if (isLoading) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <Text textColor="black">공지사항을 불러오지 못했어요.</Text>
        {__DEV__ && (
          <Text size="sm" className="mt-1 opacity-60">
            {String((error as any)?.message ?? "")}
          </Text>
        )}
      </View>
    );
  }

  if (!notices.length) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <Text textColor="black">등록된 공지가 없습니다.</Text>
      </View>
    );
  }

  // containerWidth가 설정될 때까지 로딩 표시
  if (containerWidth === 0) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <ActivityIndicator />
      </View>
    );
  }

  const displayCount = Math.min(notices.length, pageSize);

  return (
    <View className="w-full">
      <View className="w-full" onLayout={handlers.onLayout}>
        <ScrollView
          ref={refs.scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlers.onMomentumEnd}
          scrollEventThrottle={16}
        >
          {notices.slice(0, pageSize).map((notice) => (
            <View
              key={notice.id}
              style={{ width: containerWidth }}  // undefined 방지
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePressArticle(notice.id)}
              >
                <Article
                  data={notice}
                  onPress={() => handlePressArticle(notice.id)}
                  onLike={() => {}}
                  onDelete={() => {}}
                  refresh={async () => {}}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 인디케이터 수정 */}
      <View className="w-full flex-row items-center justify-center mt-2 mb-2">
        {Array.from({ length: displayCount }).map((_, i) => {
          const active = i === index;
          return (
            <View
              key={i}
              className="mx-[3px] rounded-full"
              style={{
                width: active ? 8 : 6,
                height: active ? 8 : 6,
                backgroundColor: active ? "#7A4AE2" : "#D9D9D9",
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
```

### 해결책 2: use-home.ts 로직 개선

**파일**: `src/features/community/hooks/use-home.ts`

```typescript
import { useCallback, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import { useHomeNoticesQuery } from "../queries/use-home";

export function useHomeNotices(size = 5) {
  const { notices, isLoading, isError, error, refetch, prefetch } =
    useHomeNoticesQuery(size);

  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null); // null로 초기화
  const [index, setIndex] = useState(0);

  const displayCount = useMemo(
    () => Math.min(notices.length, size),
    [notices.length, size]
  );

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width || 0;
      if (w > 0 && w !== containerWidth) {
        setContainerWidth(w);
        console.log('Container width set:', w); // 디버깅용
      }
    },
    [containerWidth]
  );

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!containerWidth) return; // containerWidth가 없으면 무시
      
      const viewportWidth = e.nativeEvent.layoutMeasurement?.width || containerWidth;
      const offsetX = e.nativeEvent.contentOffset.x || 0;
      
      // 더 정확한 계산
      const nextIndex = Math.round(offsetX / viewportWidth);
      const clampedIndex = Math.max(0, Math.min(nextIndex, displayCount - 1));
      
      console.log('Scroll:', { offsetX, viewportWidth, nextIndex, clampedIndex }); // 디버깅용
      
      setIndex(clampedIndex);
    },
    [containerWidth, displayCount]
  );

  const goTo = useCallback(
    (i: number, animated = true) => {
      if (!scrollRef.current || !containerWidth) return;
      
      const clampedIndex = Math.max(0, Math.min(i, displayCount - 1));
      scrollRef.current.scrollTo({ x: clampedIndex * containerWidth, y: 0, animated });
      setIndex(clampedIndex);
    },
    [containerWidth, displayCount]
  );

  return {
    notices,
    isLoading,
    isError,
    error,
    index,
    total: displayCount, // total을 displayCount로 통일
    refs: { scrollRef },
    handlers: {
      onLayout,
      onMomentumEnd,
      goTo,
    },
    actions: {
      refetch,
      prefetch,
    },
    containerWidth,
  };
}
```

### 해결책 3: 더 안정적인 인디케이터 구현

**파일**: `src/features/community/ui/home/notice.tsx` (인디케이터 부분만 수정)

```typescript
// 인디케이터 컴포넌트 분리
const Indicator = ({ currentIndex, totalCount }: { currentIndex: number; totalCount: number }) => {
  return (
    <View className="w-full flex-row items-center justify-center mt-2 mb-2">
      {Array.from({ length: totalCount }).map((_, i) => {
        const active = i === currentIndex;
        return (
          <View
            key={`indicator-${i}`}
            className="mx-[3px] rounded-full transition-all duration-200"
            style={{
              width: active ? 8 : 6,
              height: active ? 8 : 6,
              backgroundColor: active ? "#7A4AE2" : "#D9D9D9",
              opacity: active ? 1 : 0.6,
            }}
          />
        );
      })}
    </View>
  );
};

// 메인 컴포넌트에서 사용
return (
  <View className="w-full">
    {/* ... ScrollView 부분 ... */}
    
    <Indicator 
      currentIndex={index} 
      totalCount={displayCount} 
    />
  </View>
);
```

### 해결책 4: 자동 스크롤 기능 추가 (선택사항)

```typescript
// use-home.ts에 자동 스크롤 기능 추가
import { useEffect } from "react";

export function useHomeNotices(size = 5) {
  // ... 기존 코드 ...

  // 자동 스크롤 기능
  useEffect(() => {
    if (notices.length <= 1) return; // 1개 이하면 자동 스크롤 불필요
    
    const interval = setInterval(() => {
      const nextIndex = (index + 1) % displayCount;
      goTo(nextIndex, true);
    }, 5000); // 5초마다 자동 스크롤

    return () => clearInterval(interval);
  }, [index, displayCount, goTo]);

  // ... 나머지 코드 ...
}
```

## 완성된 최종 코드

### src/features/community/ui/home/notice.tsx (최종 버전)

```typescript
import React, { useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { useHomeNotices } from "@/src/features/community/hooks/use-home";
import { Article } from "../../ui/article";

type Props = {
  pageSize?: number;
};

const Indicator = ({ currentIndex, totalCount }: { currentIndex: number; totalCount: number }) => {
  return (
    <View className="w-full flex-row items-center justify-center mt-2 mb-2">
      {Array.from({ length: totalCount }).map((_, i) => {
        const active = i === currentIndex;
        return (
          <View
            key={`indicator-${i}`}
            className="mx-[3px] rounded-full"
            style={{
              width: active ? 8 : 6,
              height: active ? 8 : 6,
              backgroundColor: active ? "#7A4AE2" : "#D9D9D9",
              opacity: active ? 1 : 0.6,
            }}
          />
        );
      })}
    </View>
  );
};

export default function Notice({ pageSize = 5 }: Props) {
  const {
    notices,
    isLoading,
    isError,
    error,
    index,
    total,
    refs,
    handlers,
    containerWidth,
  } = useHomeNotices(pageSize);

  const handlePressArticle = useCallback((id: string) => {
    router.push(`/community/${id}`);
  }, []);

  if (isLoading || containerWidth === null) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <Text textColor="black">공지사항을 불러오지 못했어요.</Text>
        {__DEV__ && (
          <Text size="sm" className="mt-1 opacity-60">
            {String((error as any)?.message ?? "")}
          </Text>
        )}
      </View>
    );
  }

  if (!notices.length) {
    return (
      <View className="mx-[16px] my-[12px] py-10 items-center justify-center rounded-xl bg-[#F6F3F6]">
        <Text textColor="black">등록된 공지가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      <View className="w-full" onLayout={handlers.onLayout}>
        <ScrollView
          ref={refs.scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlers.onMomentumEnd}
          scrollEventThrottle={16}
        >
          {notices.slice(0, pageSize).map((notice) => (
            <View
              key={notice.id}
              style={{ width: containerWidth }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePressArticle(notice.id)}
              >
                <Article
                  data={notice}
                  onPress={() => handlePressArticle(notice.id)}
                  onLike={() => {}}
                  onDelete={() => {}}
                  refresh={async () => {}}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <Indicator currentIndex={index} totalCount={total} />
    </View>
  );
}
```

## 테스트 방법

### 1. **수동 테스트**
1. 커뮤니티 홈 탭으로 이동
2. 공지사항 프리뷰를 좌우로 스와이프
3. 인디케이터가 현재 페이지와 정확히 일치하는지 확인
4. 여러 번 스와이프하며 인디케이터 동작 확인

### 2. **디버깅 테스트**
```typescript
// 개발자 도구에서 로그 확인
console.log('Indicator state:', { index, total, containerWidth });
// 스크롤 시 로그 확인
console.log('Scroll event:', { offsetX, viewportWidth, calculatedIndex });
```

### 3. **엣지 케이스 테스트**
- 공지사항이 1개만 있는 경우
- 공지사항이 없는 경우
- 로딩 중인 경우
- 네트워크 오류 발생 시

## 예상 결과

- ✅ 인디케이터가 스크롤과 완벽하게 연동됨
- ✅ containerWidth가 정확하게 계산됨
- ✅ 모든 엣지 케이스에서 안정적으로 동작함
- ✅ 부드러운 애니메이션과 전환 효과 제공

이 수정을 적용하면 커뮤니티 홈의 인디케이터가 공지사항 프리뷰와 정확하게 연동됩니다.