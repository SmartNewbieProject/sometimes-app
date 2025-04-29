import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';
import { CommunityHeader } from '@/src/features/community/ui/community-header';
import { ArticleList } from '@/src/features/community/ui/articles';
import { useState } from 'react';
import { IconWrapper } from '@/src/shared/ui/icons';
import BellIcon from '@/assets/icons/bell.svg';
import { router } from 'expo-router';
import WriteIcon from '@/assets/icons/write.svg';
import { useCategory } from '@/src/features/community/hooks';
import Loading from '@/src/features/loading';
import { CategoryList } from '@/src/features/community/ui';
type TabType = 'realtime' | 'popular';

export default function CommunityScreen() {
  const { categories, currentCategory } = useCategory();
  const [activeTab, setActiveTab] = useState<TabType>('realtime');

  const loading = (() => {
    return false;
  })();

  const handleChangeTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  if (loading) {
    return <Loading.Page size={282} title="게시글을 불러오고 있어요" />;
  }

  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <Header.Container>
        <Header.CenterContent>
          <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />
        </Header.CenterContent>
      </Header.Container>

      <ScrollView className="flex-1 px-5">
        <CategoryList />

        <View>
          <ArticleList type={activeTab} />
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}
