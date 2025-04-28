import { Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { TouchableOpacity, View, Image, ScrollView } from "react-native";
import StopwatchIcon from '@/assets/icons/Stopwatch.svg';
import ReviewIcon from '@/assets/icons/review.svg';
import LetterIcon from '@/assets/icons/letter-heart.svg';

interface FilterButtonProps {
  activeTab: 'realtime' | 'popular' | 'review' | 'counseling';
  onChangeTab: (tab: 'realtime' | 'popular' | 'review' | 'counseling') => void;
}

export const FilterButton = ({ activeTab, onChangeTab }: FilterButtonProps) => {
  const handleTabChange = (tab: 'realtime' | 'popular' | 'review' | 'counseling') => {
    onChangeTab(tab);
  };

  return (
    <View className="">
      <ScrollView  horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            className={`w-[94px] h-[40px] flex-row items-center px-[10px] rounded-[10px] mx-[10px] ${
              activeTab === 'realtime' ? 'bg-[#7A4AE2]' : 'bg-white border border-[#7A4AE2]'
            }`}
            activeOpacity={0.7}
            onPress={() => handleTabChange('realtime')}
          >
            <IconWrapper size={32} className="text-[#7A4AE2]">
              <StopwatchIcon />
            </IconWrapper>
            <Text className="text-[14px] flex-1 leading-[120%] text-center" textColor={activeTab === 'realtime' ? 'white' : 'black'}>실시간</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`w-[78px] h-[40px] flex-row items-center justify-center rounded-[10px] mr-[10px] py-[4px] px-[10px] ${
              activeTab === 'popular' ? 'bg-[#7A4AE2]' : 'bg-white border border-[#7A4AE2]'
            }`}
            activeOpacity={0.7}
            onPress={() => handleTabChange('popular')}
          >
            <Image 
              source={require('@/assets/images/fireIcon.png')}
              style={{ width: 28, height: 28 }}
            />
            <Text className="text-[14px] flex-1 leading-[120%] text-center" textColor={activeTab === 'popular' ? 'white' : 'black'}>인기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`w-[78px] h-[40px] flex-row items-center justify-center rounded-[10px] mr-[10px] py-[4px] px-[10px] ${
              activeTab === 'review' ? 'bg-[#7A4AE2]' : 'bg-white border border-[#7A4AE2]'
            }`}
            activeOpacity={0.7}
            onPress={() => handleTabChange('review')}
          >
            <IconWrapper size={32}>
              <ReviewIcon />
            </IconWrapper>
            <Text className="text-[14px] flex-1 leading-[120%] text-center" textColor={activeTab === 'review' ? 'white' : 'black'}>리뷰</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`w-[104px] h-[40px] flex-row items-center justify-center rounded-[10px] mr-[10px] py-[4px] px-[10px] ${
              activeTab === 'counseling' ? 'bg-[#7A4AE2]' : 'bg-white border border-[#7A4AE2]'
            }`}
            activeOpacity={0.7}
            onPress={() => handleTabChange('counseling')}
          >
            <IconWrapper size={32}>
              <LetterIcon />
            </IconWrapper>
            <Text className="text-[14px] flex-1 leading-[120%] text-center" textColor={activeTab === 'counseling' ? 'white' : 'black'}>연애상담</Text>
          </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
