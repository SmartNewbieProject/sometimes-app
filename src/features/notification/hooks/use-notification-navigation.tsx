import { useNavigation } from '@react-navigation/native';
import { Notification } from '../types/notification';

type NavigationProp = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

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
      // sometimes://chat/roomId → host='chat', pathname='/roomId'
      const host = url.host;
      const id = url.pathname.slice(1); // leading slash 제거

      switch (host) {
        case 'chat':
          if (id) {
            navigation.navigate('ChatRoom' as never, { roomId: id } as never);
          }
          break;

        case 'profile':
          if (id) {
            navigation.navigate('ProfileView' as never, { userId: id } as never);
          }
          break;

        case 'community':
          if (id) {
            navigation.navigate('CommunityArticle' as never, { articleId: id } as never);
          }
          break;

        case 'discover':
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