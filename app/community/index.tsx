import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';
import { CommunityHeader } from '@/src/features/community/ui/community-header';
import { ArticleList } from '@/src/features/community/ui/articles';
import { useState } from 'react';
import { IconWrapper } from '@/src/shared/ui/icons';
import BellIcon from '@/assets/icons/bell.svg';
import { router } from 'expo-router';
import WriteIcon from '@/assets/icons/write.svg';
type TabType = 'realtime' | 'popular';

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('realtime');

  const handleChangeTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <View className="flex-1">
      <PalePurpleGradient />

      {/* Header - Compound Pattern 사용 예시 */}
      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton visible={false} />
        </Header.LeftContent>

        <Header.Logo title="커뮤니티" showLogo={true} logoSize={128} />
      
        <Header.RightContent>
          <TouchableOpacity>
            <IconWrapper>
              <BellIcon />
            </IconWrapper>
          </TouchableOpacity>
        </Header.RightContent>
      </Header.Container>

      <ScrollView className="flex-1 px-5">
        <View>
          <ArticleList type={activeTab} />
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}
