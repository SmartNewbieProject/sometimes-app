// ui/category-list/index.tsx
import Loading from "@/src/features/loading";
import { Button } from "@shared/ui";
import { Image } from "expo-image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScrollView, View, type LayoutChangeEvent } from "react-native";
import { useCategory } from "../../hooks";

type LayoutMap = Record<
  string,
  {
    x: number;
    width: number;
  }
>;

export const CategoryList = () => {
  const { categories, changeCategory, currentCategory, isLoading } =
    useCategory();

  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const itemLayoutsRef = useRef<LayoutMap>({});

  // 카테고리 수(혹은 코드 조합)가 바뀌면 이전 레이아웃 캐시를 초기화
  const routesKey = useMemo(
    () => categories.map((c) => c.code).join("|"),
    [categories]
  );
  useEffect(() => {
    itemLayoutsRef.current = {};
  }, [routesKey]);

  const onContainerLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width } = e.nativeEvent.layout;
      if (width && width !== containerWidth) {
        setContainerWidth(width);
      }
    },
    [containerWidth]
  );

  // 각 버튼 래퍼의 레이아웃 저장
  const onItemLayout = useCallback((code: string, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    const prev = itemLayoutsRef.current[code];
    if (!prev || prev.x !== x || prev.width !== width) {
      itemLayoutsRef.current[code] = { x, width };
    }
  }, []);

  const ensureVisible = useCallback(
    (code: string, animated = true) => {
      const layout = itemLayoutsRef.current[code];
      const scroller = scrollRef.current;
      if (!layout || !scroller || !containerWidth) return;

      const targetCenterX = layout.x + layout.width / 2;
      let nextScrollX = Math.max(0, targetCenterX - containerWidth / 2);

      const PADDING = 12;
      nextScrollX = Math.max(0, nextScrollX - PADDING);

      scroller.scrollTo({ x: nextScrollX, y: 0, animated });
    },
    [containerWidth]
  );

  useEffect(() => {
    if (isLoading) return;
    const id = setTimeout(() => {
      if (currentCategory) ensureVisible(currentCategory, true);
    }, 0);
    return () => clearTimeout(id);
  }, [currentCategory, isLoading, ensureVisible, routesKey]);

  return (
    <View
      className="w-full px-[16px] bg-white overflow-hidden"
      onLayout={onContainerLayout}
    >
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <Loading.Lottie title="카테고리를 불러오고 있어요" loading={isLoading}>
          <View className="flex flex-row w-full gap-x-[10px] mb-2 ">
            {categories.map((category) => (
              <View
                key={category.code}
                onLayout={(e) => onItemLayout(category.code, e)}
              >
                <Button
                  size="sm"
                  textColor={
                    currentCategory === category.code ? "white" : "black"
                  }
                  variant={
                    currentCategory === category.code ? "primary" : "outline"
                  }
                  onPress={() => {
                    changeCategory(category.code);
                    ensureVisible(category.code, true);
                  }}
                  prefix={
                    <Image
                      source={{ uri: category.emojiUrl }}
                      style={{ width: 32, height: 32 }}
                    />
                  }
                  className="px-[10px]"
                >
                  {category.displayName}
                </Button>
              </View>
            ))}
          </View>
        </Loading.Lottie>
      </ScrollView>
    </View>
  );
};
