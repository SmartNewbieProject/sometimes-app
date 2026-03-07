import { queryClient } from '@/src/shared/config/query';
import { devLogWithTag } from '@/src/shared/utils';
import { optimisticDataManager } from './optimistic-data-manager';
import { queryCacheManager } from './query-cache-manager';
import { socketConnectionManager } from './socket-event-manager';

export function initializeChatModules() {
	devLogWithTag('initializeChatModules', 'Starting initialization...');

	socketConnectionManager.initialize();
	optimisticDataManager.initialize();
	queryCacheManager.initialize(queryClient);

	devLogWithTag('initializeChatModules', 'Initialization complete');
}

export function cleanupChatModules() {
	devLogWithTag('cleanupChatModules', 'Starting cleanup...');

	socketConnectionManager.cleanup();
	optimisticDataManager.cleanup();
	queryCacheManager.cleanup();

	devLogWithTag('cleanupChatModules', 'Cleanup complete');
}
