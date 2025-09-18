import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { useDragToClose } from "../hooks/use-drag-to-close";
import { type Tab, useLoggerTabs } from "../hooks/use-logger-tabs";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import useLogs from "../hooks/use-logs";
import type { Log } from "../types/log";
import { LogItem } from "./log-item";

interface LoggerOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function LoggerOverlay({
  isVisible,
  onClose,
}: LoggerOverlayProps) {
  const { logs } = useLogs();
  const { activeTab, filteredLogs, handleTabChange, sendLogsToSlack } =
    useLoggerTabs(logs);
  const { gesture, animatedStyle } = useDragToClose({ onClose, isVisible });
  const insets = useSafeAreaInsets();
  if (!isVisible) {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.container, animatedStyle, { top: insets.top }]}
      >
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <View style={styles.tabContainer}>
          <TabButton
            title={`A (${logs.length})`}
            tabName="all"
            activeTab={activeTab}
            onPress={handleTabChange}
          />
          <TabButton
            title={`C (${
              logs.filter((l: Log) => l.type === "console").length
            })`}
            tabName="console"
            activeTab={activeTab}
            onPress={handleTabChange}
          />
          <TabButton
            title={`N (${
              logs.filter((l: Log) => l.type === "network").length
            })`}
            tabName="network"
            activeTab={activeTab}
            onPress={handleTabChange}
          />
          <Pressable style={styles.tabButton} onPress={sendLogsToSlack}>
            <Text style={styles.tabText}>Slack</Text>
          </Pressable>
        </View>

        <FlatList
          data={filteredLogs}
          renderItem={({ item }) => <LogItem log={item} />}
          keyExtractor={(item) => item.id.toString()}
          style={styles.logList}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const TabButton = ({
  title,
  tabName,
  activeTab,
  onPress,
}: {
  title: string;
  tabName: Tab;
  activeTab: string;
  onPress: (tab: Tab) => void;
}) => (
  <TouchableOpacity
    style={[styles.tabButton, activeTab === tabName && styles.activeTab]}
    onPress={() => onPress(tabName)}
  >
    <Text style={styles.tabText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#222",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleContainer: { alignItems: "center", paddingVertical: 10 },
  handle: { width: 40, height: 5, backgroundColor: "#555", borderRadius: 3 },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#555",
    marginHorizontal: 4,
  },
  activeTab: { backgroundColor: "#80c0ff" },
  tabText: { color: "white", fontWeight: "bold" },
  logList: { flex: 1, paddingHorizontal: 8 },
});
