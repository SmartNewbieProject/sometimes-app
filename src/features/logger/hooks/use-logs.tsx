import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { logObserver } from "../service/log-store-observer";
import type { Log } from "../types/log";

function useLogs() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const unsubscribe = logObserver.subscribe((logs: Log[]) => {
      setLogs([...logs.reverse()]);
    });
    return unsubscribe;
  }, []);

  return {
    logs,
  };
}

export default useLogs;
