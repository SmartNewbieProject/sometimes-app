import { View, ScrollView } from 'react-native';
import { PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';
import { ArticleList } from '@/src/features/community/ui/articles';
import { useCategory } from '@/src/features/community/hooks';
import Loading from '@/src/features/loading';
import { CategoryList, CreateArticleFAB } from '@/src/features/community/ui';

export default function CommunityScreen() {
  const { categories, currentCategory } = useCategory();

  const loading = (() => {
    return false;
  })();

  if (loading) {
    return <Loading.Page size={282} title="게시글을 불러오고 있어요" />;
  }

  return (
    <View className="flex-1 relative">
      <PalePurpleGradient />

      <Header.Container>
        <Header.CenterContent>
          <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />
        </Header.CenterContent>
      </Header.Container>

      <ScrollView className="flex-1 px-5">
        <CategoryList />

        <View>
          <ArticleList />
        </View>
      </ScrollView>

      <CreateArticleFAB />

      <BottomNavigation />
    </View>
  );
}
