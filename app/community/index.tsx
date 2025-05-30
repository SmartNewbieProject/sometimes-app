import { View, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header, ImageResource } from '@/src/shared/ui';
import { CategoryList, CreateArticleFAB, InfiniteArticleList } from '@/src/features/community/ui';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { IconWrapper } from '@/src/shared/ui/icons';
import { ImageResources } from '@/src/shared/libs';
import type { InfiniteArticleListHandle } from '@/src/features/community/ui/infinite-article-list';

export default function CommunityScreen() {
  const { refresh: shouldRefresh } = useLocalSearchParams<{ refresh: string }>();
  const infiniteArticleListRef = useRef<InfiniteArticleListHandle>(null);

  useEffect(() => {
    if (shouldRefresh === 'true') {
      if (infiniteArticleListRef.current) {
        infiniteArticleListRef.current.refresh();
      }
    }
  }, [shouldRefresh]);

  return (
    <View className="flex-1 relative">
      <PalePurpleGradient />
      <ListHeaderComponent />

      <View id="ArticleListContainer" className="flex-1">
        <InfiniteArticleList ref={infiniteArticleListRef} />
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
