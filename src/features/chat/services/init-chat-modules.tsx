import { queryClient } from "@/src/shared/config/query";
import { optimisticDataManager } from "./optimistic-data-manager";
import { queryCacheManager } from "./query-cache-manager";
import { socketConnectionManager } from "./socket-event-manager";

const globalWithChat = global as typeof global & {
  isChatInitialized?: boolean;
};

export function initializeChatModules() {
  if (globalWithChat.isChatInitialized) {
    return;
  }

  socketConnectionManager.initialize();
  optimisticDataManager.initialize();
  queryCacheManager.initialize(queryClient);

  globalWithChat.isChatInitialized = true;
}
