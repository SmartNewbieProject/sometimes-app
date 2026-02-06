import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';

interface IntroFeatureItemProps {
  text: string;
}

const IntroFeatureItem = ({ text }: IntroFeatureItemProps) => {
  return (
    <View style={styles.featureItem}>
      <View style={styles.checkIcon}>
        <Check size={16} color={colors.primaryPurple} strokeWidth={3} />
      </View>
      <Text size="15" weight="medium" textColor="black">
        {text}
      </Text>
    </View>
  );
};

interface IntroFeaturesProps {
  features: string[];
}

export const IntroFeatures = ({ features }: IntroFeaturesProps) => {
  return (
    <View style={styles.container}>
      {features.map((feature, index) => (
        <IntroFeatureItem key={index} text={feature} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F5FF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8DEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
