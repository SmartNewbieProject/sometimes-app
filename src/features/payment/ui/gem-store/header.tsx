import { View } from 'react-native';
import { Text } from '@shared/ui';
import { ImageResource } from "@ui/image-resource";
import {ImageResources} from "@shared/libs";

import { Header as SharedHeader } from '@shared/ui';

type HeaderProps = {
  gemCount: number;
}

export const Header = ({ gemCount }: HeaderProps) => {
  return <SharedHeader
      title="구슬 스토어"
      rightContent={(
          <View style={{ display: 'flex', alignItems: 'center', height: '100%', flexDirection: 'row' }}>
            <ImageResource resource={ImageResources.GEM} width={28} height={28} />
            <Text className="text-[#1B1B1B] text-[15px]">
              {gemCount}
            </Text>
          </View>
      )}
      showLogo={false}
      showBackButton
  />;
};

