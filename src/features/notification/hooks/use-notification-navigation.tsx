import { useEffect } from 'react';
import { useNavigation , StackNavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/types/navigation';
import { Notification } from '../types/notification';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const useNotificationNavigation = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleNotificationPress = (notification: Notification) => {
    if (notification.deepLink) {
      handleDeepLink(notification.deepLink);
    } else {
      navigation.navigate('NotificationList' as never);
    }
  };

  const handleDeepLink = (deepLink: string) => {
    try {
      const url = new URL(deepLink);

      switch (url.pathname) {
        case '/chat':
          const roomId = url.pathname.split('/')[2];
          if (roomId) {
            navigation.navigate('ChatRoom' as never, { roomId } as never);
          }
          break;

        case '/profile':
          const userId = url.pathname.split('/')[2];
          if (userId) {
            navigation.navigate('ProfileView' as never, { userId } as never);
          }
          break;

        case '/community':
          const articleId = url.pathname.split('/')[1];
          if (articleId) {
            navigation.navigate('CommunityArticle' as never, { articleId } as never);
          }
          break;

        case '/discover':
          navigation.navigate('Home' as never);
          break;

        default:
          navigation.navigate('NotificationList' as never);
          break;
      }
    } catch (error) {
      console.error('Deep link parsing error:', error);
      navigation.navigate('NotificationList' as never);
    }
  };

  return {
    handleNotificationPress,
    handleDeepLink,
  };
};