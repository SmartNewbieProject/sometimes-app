import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@shared/ui';
import { IconWrapper } from "@/src/shared/ui/icons";
import SmallTitle from '@/assets/icons/small-title.svg';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  subtitleContainer: {
    marginBottom: 8,
  },
  subtitle: {
    color: 'transparent',
  },
  titleContainer: {
    marginBottom: 8,
  },
});

export const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={styles.subtitleContainer}>
          <Text
            weight="light"
            size="sm"
            textColor="transparent"
          >
            내 이상형을 찾는 가장 빠른 방법
          </Text>
        </View>

        <View style={styles.titleContainer}>
          <IconWrapper width={200}>
            <SmallTitle />
          </IconWrapper>
        </View>
      </View>
    </View>
  );
};
