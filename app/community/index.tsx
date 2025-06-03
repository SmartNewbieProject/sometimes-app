import { View, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header, ImageResource } from '@/src/shared/ui';
import { CategoryList, CreateArticleFAB, InfiniteArticleList } from '@/src/features/community/ui';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { ImageResources } from '@/src/shared/libs';
import { useInfiniteArticlesQuery } from '@/src/features/community/queries/use-infinite-articles';
import { useCategory } from '@/src/features/community/hooks';

export default function CommunityScreen() {
  const { refresh: shouldRefresh } = useLocalSearchParams<{ refresh: string }>();
  const { currentCategory: categoryCode } = useCategory();
  const { refetch } = useInfiniteArticlesQuery({
    categoryCode,
    pageSize: 10,
  });

	useEffect(() => {
		if (shouldRefresh === 'true') {
      refetch();
		}
	}, [shouldRefresh]);

  return (
    <View className="flex-1 relative">
      <PalePurpleGradient />
      <ListHeaderComponent />

      <View id="ArticleListContainer" className="flex-1">
        <InfiniteArticleList />
      </View>

      <CreateArticleFAB />
      <BottomNavigation />
    </View>
  );
}

const ListHeaderComponent = () => (
  <>
    <Header.Container className="mt-2">
      <Header.CenterContent>
        <ImageResource resource={ImageResources.COMMUNITY_LOGO} width={152} height={18} />
      </Header.CenterContent>
    </Header.Container>
    
    <View className="mt-[14px]">
      <CategoryList />
    </View>
  </>
);
