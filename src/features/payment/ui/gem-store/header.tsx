import { View } from 'react-native';
import { Text } from '@shared/ui';
import { ImageResource } from "@ui/image-resource";
import {ImageResources} from "@shared/libs";
import { router } from 'expo-router';

import { Header as SharedHeader } from '@shared/ui';

type HeaderProps = {
  gemCount: number;
}

export const Header = ({ gemCount }: HeaderProps) => {
  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 12, 
      paddingVertical: 12, 
      backgroundColor: 'white' 
    }}>
      <SharedHeader.LeftButton visible={true} onPress={() => router.back()} />
      <Text size="20" weight="bold" textColor="black">구슬 스토어</Text>
      <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
        <ImageResource resource={ImageResources.GEM} width={28} height={28} />
        <Text className="text-[#1B1B1B] text-[15px]">
          {gemCount}
        </Text>
      </View>
    </View>
  );
};

