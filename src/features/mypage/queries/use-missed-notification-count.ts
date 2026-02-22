import { useQuery } from '@tanstack/react-query';
import apis from '../apis';

export const useMissedNotificationCount = (pushEnabled: boolean) =>
	useQuery({
		queryKey: ['missed-notification-count'],
		queryFn: () => apis.getMissedNotificationCount(),
		enabled: !pushEnabled,
		placeholderData: { total: 0, matching: 0, likes: 0, messages: 0 },
	});
