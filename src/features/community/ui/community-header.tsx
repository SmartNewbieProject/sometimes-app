import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import StopwatchIcon from '@/assets/icons/ph_eyes-fill.svg';
import FireIcon from '@/assets/icons/heart.svg';
import BellIcon from '@/assets/icons/bell.svg';
import CommunityIcon from '@/assets/icons/community.svg';
// features/community/ui/CommunityHeader.tsx
interface Props {
  activeTab: "realtime" | "popular";
  onChangeTab: (tab: "realtime" | "popular") => void;
}

export function CommunityHeader() {
  return (
    <View className="bg-surface-background">
      <View className="h-14 flex-row items-center px-4">
        <View className="flex-1">
          {/* Empty view for spacing */}
        </View>
        <View className="flex-1 items-center">
          <IconWrapper >
            <CommunityIcon className="w-[151px] h-[17px]" />
          </IconWrapper>
        </View>
        <View className="flex-1 items-end">
          <TouchableOpacity className="p-2" activeOpacity={0.7}>
            <IconWrapper size={20}>
              <BellIcon />
            </IconWrapper>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
