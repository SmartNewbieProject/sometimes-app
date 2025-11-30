import { Show } from "@/src/shared/ui";
import { semanticColors } from '@/src/shared/constants/colors';
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ConsoleLog, Log, NetworkLog } from "../types/log";

export const LogItem = ({ log }: { log: Log }) => {
  return (
    <View style={styles.logItemWrapper}>
      <Text style={styles.timestamp}>
        {new Date(log.timestamp).toLocaleTimeString("it-IT")}
      </Text>
      {log.type === "console" ? (
        <ConsoleLogView log={log} />
      ) : (
        <NetworkLogView log={log} />
      )}
    </View>
  );
};

const ConsoleLogView = ({ log }: { log: ConsoleLog }) => {
  const levelStyles = {
    error: { borderLeftColor: "#ff8080" },
    warn: { borderLeftColor: "#ffdd80" },
    log: { borderLeftColor: "#95a5a6" },
    debug: { borderLeftColor: "#80c0ff" },
    trace: { borderLeftColor: "#c080ff" },
  };

  return (
    <View style={[styles.container, levelStyles[log.level]]}>
      <Text style={styles.levelText}>CONSOLE.{log.level.toUpperCase()}</Text>
      <View>
        {log.data.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Text key={index} style={styles.dataText}>
            {typeof item === "object"
              ? JSON.stringify(item, null, 2)
              : String(item)}
          </Text>
        ))}
      </View>
    </View>
  );
};

const NetworkLogView = ({ log }: { log: NetworkLog }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusColor = log.status >= 400 ? "#ff8080" : "#80ff80";

  return (
    <Pressable
      style={[styles.container, { borderLeftColor: statusColor }]}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <View style={styles.summaryContainer}>
        <Text style={{ color: statusColor, fontWeight: "bold" }}>
          {log.method.toUpperCase()} {log.status}
        </Text>
        <Text style={styles.urlText} numberOfLines={1}>
          {log.url}
        </Text>
        <Text style={styles.durationText}>{log.duration}</Text>
      </View>
      <Show when={isExpanded}>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Request Body:</Text>
          <Text style={styles.bodyText}>
            {log.requestBody ? String(log.requestBody) : "N/A"}
          </Text>
          <Text style={styles.detailTitle}>Response Body:</Text>
          <Text style={styles.bodyText}>{log.responseBody || "N/A"}</Text>
        </View>
      </Show>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  logItemWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  container: {
    flex: 1,
    padding: 8,
    marginVertical: 4,
    backgroundColor: semanticColors.text.secondary,
    borderLeftWidth: 4,
    borderRadius: 4,
  },
  timestamp: { color: "#888", fontSize: 12, marginRight: 8, marginTop: 8 },
  levelText: {
    color: semanticColors.text.inverse,
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 12,
  },
  dataText: { color: "#eee", fontFamily: "monospace" }, // 모노스페이스 폰트로 가독성 향상
  summaryContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  urlText: { color: "#eee", flex: 1 },
  durationText: { color: "#888", fontSize: 12 },
  detailsContainer: {
    marginTop: 10,
    borderTopColor: "#555",
    borderTopWidth: 1,
    paddingTop: 8,
  },
  detailTitle: { color: "#aaa", fontWeight: "bold", marginBottom: 4 },
  bodyText: { color: "#eee", fontFamily: "monospace" },
});
