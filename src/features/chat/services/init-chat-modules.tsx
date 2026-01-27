import { queryClient } from '@/src/shared/config/query';
import { optimisticDataManager } from './optimistic-data-manager';
import { queryCacheManager } from './query-cache-manager';
import { socketConnectionManager } from './socket-event-manager';

export function initializeChatModules() {
	console.log('[initializeChatModules] Starting initialization...');

	socketConnectionManager.initialize();
	optimisticDataManager.initialize();
	queryCacheManager.initialize(queryClient);

	console.log('[initializeChatModules] Initialization complete');
}

export function cleanupChatModules() {
	console.log('[cleanupChatModules] Starting cleanup...');

	socketConnectionManager.cleanup();
	optimisticDataManager.cleanup();
	queryCacheManager.cleanup();

	console.log('[cleanupChatModules] Cleanup complete');
}
