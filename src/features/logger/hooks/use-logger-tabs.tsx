import { useMemo, useState } from "react";
import type { Log } from "../types/log";

export type Tab = "all" | "console" | "network";

export const useLoggerTabs = (logs: Log[]) => {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filteredLogs = useMemo(() => {
    if (activeTab === "console") {
      return logs.filter((log) => log.type === "console");
    }
    if (activeTab === "network") {
      return logs.filter((log) => log.type === "network");
    }
    return logs;
  }, [logs, activeTab]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return { activeTab, filteredLogs, handleTabChange };
};
