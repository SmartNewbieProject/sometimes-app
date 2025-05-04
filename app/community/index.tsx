import { View, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';
import { CategoryList, CreateArticleFAB, InfiniteArticleList } from '@/src/features/community/ui';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { InfiniteArticleListHandle } from '@/src/features/community/ui/infinite-article-list';

export default function CommunityScreen() {
  const { refresh: shouldRefresh } = useLocalSearchParams<{ refresh: string }>();
  const infiniteArticleListRef = useRef<InfiniteArticleListHandle>(null);

  useEffect(() => {
    if (shouldRefresh === 'true') {
      if (infiniteArticleListRef.current) {
        infiniteArticleListRef.current.refresh();
      }
      router.setParams({});
    }
  }, [shouldRefresh]);

  return (
    <View className="flex-1 relative">
      <PalePurpleGradient />

      <Header.Container>
        <Header.CenterContent>
          <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />
        </Header.CenterContent>
      </Header.Container>

      <ScrollView className="flex-1">
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
