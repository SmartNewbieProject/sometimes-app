import React, { memo, type ReactNode, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { logObserver } from "../../service/log-store-observer";
import LoggerOverlay from "../logger-overlay";

interface LogProviderProps {
  children: ReactNode;
}

function LogProvider({ children }: LogProviderProps) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const unscribe = logObserver.subscribe((logs: any[]) => {
      setLogs(logs);
    });
    return unscribe;
  }, []);

  return (
    <>
      {children}
      <LoggerOverlay logs={logs} />
    </>
  );
}

export default LogProvider;
