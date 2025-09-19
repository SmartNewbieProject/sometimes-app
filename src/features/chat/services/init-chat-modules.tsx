import { queryClient } from "@/src/shared/config/query";
import { optimisticDataManager } from "./optimistic-data-manager";
import { queryCacheManager } from "./query-cache-manager";
import { socketConnectionManager } from "./socket-event-manager";

let isInitialized = false;

export function initializeChatModules() {
  if (isInitialized) return;

  socketConnectionManager.initialize();
  optimisticDataManager.initialize();
  queryCacheManager.initialize(queryClient);

  isInitialized = true;
}
