import { Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { TouchableOpacity, View, Image } from "react-native";
import StopwatchIcon from '@/assets/icons/Stopwatch.svg';
import { useState } from 'react';
import { mockArticles, mockPopularArticles, mockComments } from '../mocks/articles';
import { Article } from '../types';

interface FilterButtonProps {
  activeTab: 'realtime' | 'popular';
  onChangeTab: (tab: 'realtime' | 'popular') => void;
}

export const FilterButton = ({ activeTab, onChangeTab }: FilterButtonProps) => {
  const handleTabChange = (tab: 'realtime' | 'popular') => {
    onChangeTab(tab);
  };

  return (
    <View className="px-4 py-2">
      <View className="flex-row gap-2">
        <TouchableOpacity 
          className={`w-[94px] h-[40px] flex-row items-center justify-center rounded-[10px] py-1.5 px-3 ${
            activeTab === 'realtime' ? 'bg-[#7A4AE2]' : 'bg-white border border-[#7A4AE2]'
          }`}
          activeOpacity={0.7}
          onPress={() => handleTabChange('realtime')}
        >
          <IconWrapper size={32} className="text-[#7A4AE2] ">
            <StopwatchIcon />
          </IconWrapper>
          <Text className="text-[13px] h-[18] w-[39]" textColor={activeTab === 'realtime' ? 'white' : 'black'}>실시간</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`w-[94px] h-[40px] flex-row items-center justify-center rounded-[10px] py-1.5 px-3 ${
            activeTab === 'popular' ? 'bg-[#7A4AE2]' : 'bg-white border border-[#7A4AE2]'
          }`}
          activeOpacity={0.7}
          onPress={() => handleTabChange('popular')}
        >
          <Image 
            source={require('@/assets/images/fireIcon.png')}
            style={{ width: 32, height: 32 }}
          />
          <Text className="text-[13px] h-[18] w-[39]" textColor={activeTab === 'popular' ? 'white' : 'black'}>인기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
