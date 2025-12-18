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
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useCategory } from "../../hooks";
import { NOTICE_CODE } from "@/src/features/community/queries/use-home";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useTranslation } from "react-i18next";

type LayoutMap = Record<string, { x: number; width: number }>;

const HOME_CODE = "__home__";

function hasEmojiUrl(c: unknown): c is { emojiUrl: string } {
  return !!c && typeof (c as any).emojiUrl === "string";
}

export const CategoryList = () => {
  const { categories, changeCategory, currentCategory, isLoading } =
    useCategory();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const itemLayoutsRef = useRef<LayoutMap>({});

  const augmentedCategories = useMemo(
    () => [{ code: HOME_CODE, displayName: "홈" } as const, ...(Array.isArray(categories) ? categories : [])],
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
    <View style={styles.container} onLayout={onContainerLayout}>
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <Loading.Lottie title={t("features.community.ui.category_list.loading_categories")} loading={isLoading}>
          <View style={styles.categoriesRow}>
            {renderCategories.map((category) => {
              const isActive = currentCategory === category.code;

              return (
                <View
                  key={category.code}
                  onLayout={(e) => onItemLayout(category.code, e)}
                >
                  <Button
                    size="sm"
                    variant="white"
                    textColor={isActive ? "white" : "dark"}
                    onPress={() => {
                      changeCategory(category.code);
                      ensureVisible(category.code, true);
                    }}
                    styles={[
                      styles.categoryButton,
                      isActive ? styles.categoryButtonActive : styles.categoryButtonInactive,
                    ]}
                    prefix={
                      category.code === HOME_CODE ? (
                        <Image
                          source={require("@/assets/images/home.png")}
                          style={styles.categoryIcon}
                        />
                      ) : hasEmojiUrl(category) ? (
                        <Image
                          source={{ uri: (category as any).emojiUrl }}
                          style={styles.categoryIcon}
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    backgroundColor: semanticColors.surface.background,
    overflow: "hidden",
  },
  categoriesRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 0,
  },
  categoryButtonActive: {
    backgroundColor: semanticColors.brand.primary,
  },
  categoryButtonInactive: {
    backgroundColor: semanticColors.surface.secondary,
  },
  categoryIcon: {
    width: 32,
    height: 32,
  },
});
