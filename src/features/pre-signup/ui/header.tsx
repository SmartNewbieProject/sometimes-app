import React from 'react';
import { View } from 'react-native';
import { Text } from '@shared/ui';
import { IconWrapper } from "@/src/shared/ui/icons";
import SmallTitle from '@/assets/icons/small-title.svg';
import { useTranslation } from 'react-i18next';


export const Header: React.FC = () => {
  
  const { t } = useTranslation();

  return (
    <View className="flex-row justify-between items-start mb-4">
      <View className="flex-1 items-center">
        <View className="mb-2">
          <Text
            weight="light"
            size="sm"
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A3EA1] to-[#9D6FFF] whitespace-nowrap"
          >
            {t("features.pre-signup.ui.header.subtitle")}
          </Text>
        </View>

        <View className="mb-2">
          <IconWrapper width={200} className="text-primaryPurple">
            <SmallTitle />
          </IconWrapper>
        </View>
      </View>
    </View>
  );
};
