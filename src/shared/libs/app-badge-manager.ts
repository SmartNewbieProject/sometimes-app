import * as Notifications from 'expo-notifications';

class AppBadgeManager {
  private notificationCount = 0;
  private chatUnreadCount = 0;

  setNotificationCount(count: number) {
    this.notificationCount = Math.max(0, count);
    this.updateBadge();
  }

  setChatUnreadCount(count: number) {
    this.chatUnreadCount = Math.max(0, count);
    this.updateBadge();
  }

  getTotalCount() {
    return this.notificationCount + this.chatUnreadCount;
  }

  private async updateBadge() {
    const total = this.getTotalCount();
    try {
      await Notifications.setBadgeCountAsync(total);
    } catch (error) {
      console.warn('Failed to update app badge:', error);
    }
  }

  reset() {
    this.notificationCount = 0;
    this.chatUnreadCount = 0;
    this.updateBadge();
  }
}

export const appBadgeManager = new AppBadgeManager();
