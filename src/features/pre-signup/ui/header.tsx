import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@shared/ui';
import { IconWrapper } from "@/src/shared/ui/icons";
import SmallTitle from '@/assets/icons/small-title.svg';
import { useTranslation } from 'react-i18next';


export const Header: React.FC = () => {

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.subtitleContainer}>
          <Text
            weight="light"
            size="sm"
            textColor="purple"
          >
            {t("features.pre-signup.ui.header.subtitle")}
          </Text>
        </View>

        <View style={styles.titleContainer}>
          <IconWrapper width={200} color="#8B5CF6">
            <SmallTitle />
          </IconWrapper>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  subtitleContainer: {
    marginBottom: 8,
  },
  titleContainer: {
    marginBottom: 8,
  },
});
