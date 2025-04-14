import React from 'react';
import { View } from 'react-native';
import { Text } from '@/src/shared/ui/text';
import { IconWrapper } from '@/src/shared/ui/icons';
import SmallTitle from '@/assets/icons/small-title.svg';

interface LogoProps {
  title?: string;
  showLogo?: boolean;
  logoSize?: number;
}

export function Logo({ title, showLogo = true, logoSize = 32 }: LogoProps) {
  return (
    <View className="flex-1 items-center justify-center">
      {showLogo ? (
        <IconWrapper width={logoSize} className="text-primaryPurple">
          <SmallTitle />
        </IconWrapper>
      ) : (
        <Text size="lg" weight="bold" textColor="purple">
          {title || 'SOMETIME'}
        </Text>
      )}
    </View>
  );
}
