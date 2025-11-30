// src/features/community/ui/category-list/index.tsx
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
import { ScrollView, View, type LayoutChangeEvent, StyleSheet } from "react-native";
import { useCategory } from "../../hooks";
import { NOTICE_CODE } from "@/src/features/community/queries/use-home";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/colors";

type LayoutMap = Record<string, { x: number; width: number }>;

const HOME_CODE = "__home__";

function hasEmojiUrl(c: unknown): c is { emojiUrl: string } {
  return !!c && typeof (c as any).emojiUrl === "string";
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: semanticColors.surface.background,
    overflow: 'hidden',
  },
  categoriesContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: colors.primaryPurple,
  },
  inactiveCategoryButton: {
    backgroundColor: semanticColors.surface.secondary,
  },
  homeIcon: {
    width: 32,
    height: 32,
  },
  emojiIcon: {
    width: 32,
    height: 32,
  },
});

export const CategoryList = () => {
  const { categories, changeCategory, currentCategory, isLoading } =
    useCategory();

  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const itemLayoutsRef = useRef<LayoutMap>({});

  const augmentedCategories = useMemo(
    () => [{ code: HOME_CODE, displayName: "홈" } as const, ...categories],
    [categories]
  );

  const renderCategories = useMemo(
    () => augmentedCategories.filter((c) => c.code !== NOTICE_CODE),
    [augmentedCategories]
  );

  const routesKey = useMemo(
    () => renderCategories.map((c) => c.code).join("|"),
    [renderCategories]
  );

  useEffect(() => {
    itemLayoutsRef.current = {};
  }, [routesKey]);

  const onContainerLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width } = e.nativeEvent.layout;
      if (width && width !== containerWidth) setContainerWidth(width);
    },
    [containerWidth]
  );

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
      style={styles.container}
      onLayout={onContainerLayout}
    >
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <Loading.Lottie title="카테고리를 불러오고 있어요" loading={isLoading}>
          <View style={styles.categoriesContainer}>
            {renderCategories.map((category) => {
              const isActive = currentCategory === category.code;

              return (
                <View
                  key={category.code}
                  onLayout={(e) => onItemLayout(category.code, e)}
                >
                  <Button
                    size="sm"
                    variant={isActive ? "primary" : "white"}
                    textColor={isActive ? "white" : "dark"}
                    onPress={() => {
                      changeCategory(category.code);
                      ensureVisible(category.code, true);
                    }}
                    styles={[
                      styles.categoryButton,
                      isActive ? styles.activeCategoryButton : styles.inactiveCategoryButton
                    ]}
                    prefix={
                      category.code === HOME_CODE ? (
                        <Image
                          source={require("@/assets/images/home.png")}
                          style={styles.homeIcon}
                        />
                      ) : hasEmojiUrl(category) ? (
                        <Image
                          source={{ uri: (category as any).emojiUrl }}
                          style={styles.emojiIcon}
                        />
                      ) : undefined
                    }
                  >
                    {category.displayName}
                  </Button>
                </View>
              );
            })}
          </View>
        </Loading.Lottie>
      </ScrollView>
    </View>
  );
};
