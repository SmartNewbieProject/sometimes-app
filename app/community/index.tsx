import { View, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';
import Loading from '@/src/features/loading';
import { CategoryList, CreateArticleFAB, InfiniteArticleList } from '@/src/features/community/ui';

export default function CommunityScreen() {
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
          <InfiniteArticleList />
        </View>
      </ScrollView>

      <CreateArticleFAB />

      <BottomNavigation />
    </View>
  );
}
