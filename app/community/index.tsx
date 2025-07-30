import { useCategory } from "@/src/features/community/hooks";
import { useInfiniteArticlesQuery } from "@/src/features/community/queries/use-infinite-articles";
import {
  CategoryList,
  CreateArticleFAB,
  InfiniteArticleList,
} from "@/src/features/community/ui";
import { ImageResources } from "@/src/shared/libs";
import {
  BottomNavigation,
  Header,
  ImageResource,
  PalePurpleGradient,
} from "@/src/shared/ui";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { refresh: shouldRefresh } = useLocalSearchParams<{
    refresh: string;
  }>();
  const { currentCategory: categoryCode } = useCategory();
  const { refetch } = useInfiniteArticlesQuery({
    categoryCode,
    pageSize: 10,
  });

  useEffect(() => {
    if (shouldRefresh === "true") {
      refetch();
    }
  }, [shouldRefresh]);

  return (
    <View className="flex-1 relative">
      <ListHeaderComponent />

      <View id="ArticleListContainer" className="flex-1">
        <InfiniteArticleList />
      </View>

      <CreateArticleFAB />
      <BottomNavigation />
    </View>
  );
}

const ListHeaderComponent = () => {
  const insets = useSafeAreaInsets();
  return (
    <View>
      <Header.Container className="items-center bg-white ">
        <Header.CenterContent>
          <ImageResource
            resource={ImageResources.COMMUNITY_LOGO}
            width={152}
            height={18}
          />
        </Header.CenterContent>
      </Header.Container>

      <View className="pt-[14px] bg-white">
        <CategoryList />
      </View>
    </View>
  );
};
