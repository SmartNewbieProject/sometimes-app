import { TouchableOpacity, View, Image } from 'react-native';
import { CommunityHeader } from '@/src/features/community/ui/community-header';
import { ArticleList } from '@/src/features/community/ui/articles';
import { useState } from 'react';
import { Text } from '@/src/shared/ui';
import { FilterButton } from '@/src/features/community/ui';
import VectorIcon from '@/assets/icons/Vector.svg';
import { IconWrapper } from '@/src/shared/ui/icons';
type TabType = 'realtime' | 'popular';

export default function Community() {
  const [activeTab, setActiveTab] = useState<TabType>('realtime');

  const handleChangeTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <View className="flex-1 bg-white">
      <CommunityHeader/>
      <ArticleList type={activeTab} />
    </View>
  );
} 