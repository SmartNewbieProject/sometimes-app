import { Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { TouchableOpacity, View, Image } from "react-native";
import StopwatchIcon from '@/assets/icons/Stopwatch.svg';

export const FilterButton = ({activeTab, onChangeTab}: {activeTab: string, onChangeTab: (tab: string) => void}) => {
  return (
    <View className="px-4 py-2">
      <View className="flex-row gap-2">
        <TouchableOpacity 
          className={`flex-row items-center justify-center rounded-[10px] py-1.5 px-3 ${
            activeTab === 'realtime' ? 'bg-[#7A4AE2]' : 'bg-white border border-[#7A4AE2]'
          }`}
          activeOpacity={0.7}
          onPress={() => onChangeTab('realtime')}
        >
          <IconWrapper size={32} className="text-[#7A4AE2] mr-1">
            <StopwatchIcon />
          </IconWrapper>
          <Text size="13" textColor={activeTab === 'realtime' ? 'white' : 'black'}>실시간</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex-row items-center justify-center rounded-[10px] py-1.5 px-3 ${
            activeTab === 'popular' ? 'bg-[#7A4AE2]' : 'bg-white border border-[#7A4AE2]'
          }`}
          activeOpacity={0.7}
          onPress={() => onChangeTab('popular')}
        >
          <Image 
            source={require('@/assets/images/fireIcon.png')}
            style={{ width: 32, height: 32 }}
          />
          <Text size="13" textColor={activeTab === 'popular' ? 'white' : 'black'} className="ml-1">인기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
