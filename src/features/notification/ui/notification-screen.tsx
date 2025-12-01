import React from 'react';
import { semanticColors } from '../../../shared/constants/colors';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/shared/ui';
import { NotificationList } from './notification-list';

export const NotificationScreen: React.FC = () => {
  const handleNotificationPress = (notification: any) => {
    console.log('Notification pressed:', notification);
  };

  return (
    <View style={styles.container}>
      <NotificationList onNotificationPress={handleNotificationPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
});