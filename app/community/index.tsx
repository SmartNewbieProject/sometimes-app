import { View, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header, ImageResource } from '@/src/shared/ui';
import { CategoryList, CreateArticleFAB, InfiniteArticleList } from '@/src/features/community/ui';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { InfiniteArticleListHandle } from '@/src/features/community/ui/infinite-article-list';
import { IconWrapper } from '@/src/shared/ui/icons';
import { ImageResources } from '@/src/shared/libs';

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

      <Header.Container className="mt-2">
        <Header.CenterContent>
          <ImageResource resource={ImageResources.COMMUNITY_LOGO} width={152} height={18} />
        </Header.CenterContent>
      </Header.Container>

      <ScrollView className="flex-1 mt-[14px]">
        <CategoryList />

        <View id="ArticleListContainer">
          <InfiniteArticleList ref={infiniteArticleListRef} />
        </View>
      </ScrollView>

      <CreateArticleFAB />

      <BottomNavigation />
    </View>
  );
}
