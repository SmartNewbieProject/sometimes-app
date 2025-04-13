import { View } from 'react-native';
import { CommunityHeader } from '@/src/features/community/ui/community-header';
import { ArticleList } from '@/src/features/community/ui/articles';
import { useState } from 'react';
import { Text } from '@/src/shared/ui';
import { FilterButton } from '@/src/features/community/ui';

type TabType = 'realtime' | 'popular';

export default function Community() {
  const [activeTab, setActiveTab] = useState<TabType>('realtime');

  const handleChangeTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <View className="flex-1 bg-white">
      <CommunityHeader/>
      <View className="h-[1px] bg-[#F3F0FF]" />
      <FilterButton activeTab={activeTab} onChangeTab={handleChangeTab} />
      <View className="h-[1px] bg-[#F3F0FF]" />
      <View className="bg-lightPurple/20 px-4 py-2 flex-row items-center">
        <Text size="sm">🔥</Text>
        <Text size="sm">토끼는 귀해. 그래서 귀사.</Text>
      </View>
      <View className="h-[1px] bg-[#F3F0FF]" />
      <ArticleList type={activeTab} />
    </View>
  );
} 